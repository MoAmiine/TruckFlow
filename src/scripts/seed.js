require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Camion = require('../models/Camion');
const Remorque = require('../models/Remorque');
const Trajet = require('../models/Trajet');

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/truckflow';
        console.log(`🔌 Connexion à MongoDB (${mongoUri})...`);
        await mongoose.connect(mongoUri);
        console.log('✅ Connecté avec succès.');

        // 1. Initialisation des Utilisateurs de vérification (Admin, Chauffeur Actif, Chauffeur Suspendu)
        console.log('\n👤 Configuration des comptes de test...');
        
        // Supprimer les comptes existants avec ces emails pour garantir les mots de passe et statuts
        await User.deleteMany({
            email: {
                $in: [
                    'admin@truckflow.com',
                    'chauffeur@truckflow.com',
                    'suspendu@truckflow.com'
                ]
            }
        });

        const admin = await User.create({
            nom: 'Admin',
            prenom: 'Super',
            email: 'admin@truckflow.com',
            motDePasse: 'admin123456',
            role: 'admin',
            statut: 'actif'
        });

        const chauffeurActif = await User.create({
            nom: 'Alami',
            prenom: 'Karim',
            email: 'chauffeur@truckflow.com',
            motDePasse: 'chauffeur123456',
            role: 'chauffeur',
            statut: 'actif'
        });

        const chauffeurSuspendu = await User.create({
            nom: 'Bennani',
            prenom: 'Youssef',
            email: 'suspendu@truckflow.com',
            motDePasse: 'chauffeur123456',
            role: 'chauffeur',
            statut: 'suspendu'
        });

        console.log('✅ 3 Comptes créés :');
        console.log('   - [Admin]              : admin@truckflow.com     | Pass: admin123456');
        console.log('   - [Chauffeur Actif]    : chauffeur@truckflow.com | Pass: chauffeur123456');
        console.log('   - [Chauffeur Suspendu] : suspendu@truckflow.com  | Pass: chauffeur123456');

        // 2. Initialisation des Camions
        console.log('\n🚛 Configuration des camions...');
        await Camion.deleteMany({
            immatriculation: {
                $in: ['12345-A-26', '67890-B-26', '11223-C-26', '44556-D-26']
            }
        });

        const camion1 = await Camion.create({
            immatriculation: '12345-A-26',
            marque: 'Volvo',
            modele: 'FH16 750',
            kilometrageActuel: 45000,
            statut: 'disponible',
            seuilVidangeKm: 10000,
            seuilRevisionKm: 30000
        });

        const camion2 = await Camion.create({
            immatriculation: '67890-B-26',
            marque: 'Scania',
            modele: 'R500 V8',
            kilometrageActuel: 82000,
            statut: 'en_mission',
            seuilVidangeKm: 10000,
            seuilRevisionKm: 30000
        });

        const camion3 = await Camion.create({
            immatriculation: '11223-C-26',
            marque: 'Mercedes-Benz',
            modele: 'Actros 1845',
            kilometrageActuel: 120000,
            statut: 'maintenance',
            seuilVidangeKm: 10000,
            seuilRevisionKm: 30000
        });

        const camion4 = await Camion.create({
            immatriculation: '44556-D-26',
            marque: 'Renault Trucks',
            modele: 'T-High 520',
            kilometrageActuel: 15000,
            statut: 'disponible',
            seuilVidangeKm: 10000,
            seuilRevisionKm: 30000
        });

        console.log('✅ 4 Camions créés (disponible, en_mission, maintenance).');

        // 3. Initialisation des Remorques
        console.log('\n📦 Configuration des remorques...');
        await Remorque.deleteMany({
            immatriculation: { $in: ['R-1001-26', 'R-2002-26'] }
        });

        const remorque1 = await Remorque.create({
            immatriculation: 'R-1001-26',
            type: 'citerne',
            capaciteCharge: 25000,
            statut: 'en_mission'
        });

        const remorque2 = await Remorque.create({
            immatriculation: 'R-2002-26',
            type: 'plateau',
            capaciteCharge: 30000,
            statut: 'disponible'
        });
        console.log('✅ 2 Remorques créées.');

        // 4. Initialisation d'un Trajet assigné au chauffeur actif (pour l'espace Chauffeur "Mes trajets")
        console.log('\n🗺️  Configuration des trajets de démonstration...');
        await Trajet.deleteMany({
            chauffeurId: chauffeurActif._id
        });

        const trajetActif = await Trajet.create({
            siteDepart: 'Youssoufia - Site Central OCP',
            siteArrivee: 'Casablanca - Port Jorf Lasfar',
            marchandise: 'Phosphate Enrichi (25T)',
            dateDepartPrevue: new Date(),
            dateArriveePrevue: new Date(Date.now() + 24 * 3600 * 1000),
            chauffeurId: chauffeurActif._id,
            camionId: camion2._id,
            remorqueId: remorque1._id,
            statut: 'en_cours',
            kilometrageDepart: 82000
        });

        console.log('✅ 1 Trajet en cours créé et assigné à Karim Alami (Chauffeur Actif).');

        console.log('\n======================================================');
        console.log('🎉 SEEDING TERMINÉ AVEC SUCCÈS !');
        console.log('   La base de données TruckFlow est 100% prête pour');
        console.log('   le développement et l\'évaluation du Sprint 3 React.');
        console.log('======================================================\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur lors du seeding :', err);
        process.exit(1);
    }
}

seed();
