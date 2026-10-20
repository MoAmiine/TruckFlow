# ⚡ Guide Pratique Redis — TruckFlow

Ce guide explique les concepts fondamentaux de **Redis**, son rôle dans une architecture backend professionnelle, et comment l'utiliser concrètement avec **Node.js (`ioredis`)** et **Docker**.

---

## 1. Qu'est-ce que Redis ?

**Redis** (*Remote Dictionary Server*) est une base de données **NoSQL Clé-Valeur en mémoire vive (In-Memory)** ultra-rapide.

| Caractéristique | MongoDB | Redis |
| :--- | :--- | :--- |
| **Stockage** | Disque dur (SSD / HDD) | **RAM (Mémoire Vive)** |
| **Vitesse** | Millisecondes (~5-50 ms) | **Microsecondes (< 1 ms)** |
| **Rôle principal** | Données permanentes & complexes | **Cache, Rate Limiting, Compteurs, Sessions** |
| **Persistance** | Totale | Optionnelle (Snapshots RDB / AOF) |

---

## 2. Cas d'Usage Principaux dans TruckFlow

1. **Le Caching (Mise en cache) :**
   * Éviter d'exécuter des requêtes lourdes ou répétitives sur MongoDB (ex: liste des camions, matrice d'usure des pneus).
   * Schéma **Cache-Aside** : on vérifie d'abord Redis ; si absent (*Cache Miss*), on interroge MongoDB et on sauvegarde dans Redis avec un temps d'expiration (**TTL**).

2. **Rate Limiting Distribué (Sécurité du trafic) :**
   * Bloquer les attaques Brute-force sur `/api/auth/login`.
   * Limiter le nombre de requêtes par IP (ex: max 100 requêtes / 15 minutes).

3. **Invalidation et Blacklist de Tokens :**
   * Stocker temporairement les tokens révoqués lors d'un logout.

---

## 3. Configuration dans TruckFlow

Le client est configuré dans `src/config/redis.js` avec la bibliothèque performante **`ioredis`** :

```javascript
// src/config/redis.js
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  lazyConnect: true
});

redisClient.on('connect', () => {
  console.log('✅ Connecté à Redis avec succès !');
});

redisClient.on('error', (err) => {
  console.warn('⚠️ Avertissement Redis :', err.message);
});

module.exports = redisClient;
```

---

## 4. Les Commandes Essentielles en Node.js (`ioredis`)

### A. Écrire et Lire une chaîne simple
```javascript
const redisClient = require('../config/redis');

// Écrire
await redisClient.set('cle', 'valeur');

// Lire
const valeur = await redisClient.get('cle');
```

### B. Sauvegarder des données avec un TTL (Expiration automatique)
```javascript
// 'EX', 300 signifie expiration dans 300 secondes (5 minutes)
await redisClient.set('cle', 'valeur', 'EX', 300);
```

### C. Mettre en cache un Objet ou un Tableau JSON
Redis ne stocke que des chaînes. On utilise donc `JSON.stringify` et `JSON.parse` :
```javascript
const camions = await Camion.find();

// Mise en cache pour 1 heure (3600 secondes)
await redisClient.set('cache:camions:all', JSON.stringify(camions), 'EX', 3600);

// Récupération
const cachedData = await redisClient.get('cache:camions:all');
if (cachedData) {
  const result = JSON.parse(cachedData);
}
```

### D. Supprimer une clé du cache (Invalidation)
```javascript
// Lors d'une création, mise à jour ou suppression d'un camion :
await redisClient.del('cache:camions:all');
```

### E. Incrémentation atomique (Compteur / Rate Limiting)
```javascript
// Incrémente la valeur de 1 (très utile pour compter les tentatives de connexion)
const tentatives = await redisClient.incr(`login_attempts:${userIp}`);

// Définir une expiration sur le compteur (ex: 60 secondes)
if (tentatives === 1) {
  await redisClient.expire(`login_attempts:${userIp}`, 60);
}
```

---

## 5. Exemple Concret : Pattern Cache-Aside dans un Service

Voici comment appliquer Redis sur une fonction de consultation :

```javascript
// src/services/camion.service.js
const Camion = require('../models/Camion');
const redisClient = require('../config/redis');

async function getAllCamions() {
  const CACHE_KEY = 'camions:disponibles';

  // 1. Vérifier si les données sont dans Redis (Cache Hit)
  try {
    const cachedCamions = await redisClient.get(CACHE_KEY);
    if (cachedCamions) {
      console.log('⚡ Données retournées depuis le Cache Redis !');
      return JSON.parse(cachedCamions);
    }
  } catch (err) {
    console.warn('Erreur de lecture Redis, repli sur MongoDB');
  }

  // 2. Si absent du cache (Cache Miss), interroger MongoDB
  const camions = await Camion.find({ statut: { $ne: 'archive' } });

  // 3. Stocker dans Redis pour 10 minutes (600s) pour les prochains appels
  try {
    await redisClient.set(CACHE_KEY, JSON.stringify(camions), 'EX', 600);
  } catch (err) {
    console.warn('Erreur d\'écriture Redis');
  }

  return camions;
}

// 4. Invalidation : lorsqu'un camion change de statut ou est créé
async function createCamion(data) {
  const nouveauCamion = await Camion.create(data);
  // Vider le cache pour forcer le rafraîchissement
  await redisClient.del('camions:disponibles');
  return nouveauCamion;
}
```

---

## 6. Commandes CLI Utiles via Docker

Pour explorer ce qui est stocké dans Redis directement depuis votre terminal :

```bash
# 1. Ouvrir le terminal interactif redis-cli dans le conteneur Docker
docker exec -it truckflow_redis redis-cli

# Si un mot de passe est configuré :
AUTH votre_mot_de_passe

# 2. Tester la connexion
PING
# Réponse attendue : PONG

# 3. Voir toutes les clés stockées
KEYS *

# 4. Voir le contenu d'une clé
GET cache:camions:all

# 5. Voir le temps restant avant expiration (en secondes)
TTL cache:camions:all

# 6. Supprimer une clé
DEL cache:camions:all

# 7. Vider TOUT le cache
FLUSHALL

# 8. Quitter
exit
```

---

## 7. Argumentaire pour la Soutenance (Pourquoi Redis ?)

> *"Pour optimiser les performances de TruckFlow v2, j'ai introduit Redis comme couche de cache in-memory et de rate limiting. Cela permet de décharger la base de données MongoDB, de réduire la latence à moins de 1 ms sur les requêtes fréquentes et de protéger nos endpoints contre les abus."*
