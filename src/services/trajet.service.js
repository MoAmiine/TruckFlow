const Trajet = require('../models/Trajet');
const availabilityService = require('./availability.service');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const Camion = require('../models/Camion');

async function createTrajet(data) {
    const available = await availabilityService.verifierDisponibilite(
        data.camionId,
        data.remorqueId,
        data.chauffeurId,
        data.dateDepartPrevue,
        data.dateArriveePrevue
    )
    if (available) {
        const trajet = await Trajet.create(data)
        return trajet
    }
}

async function getAllTrajet(filtres = {}, user) {
    if (user.role === 'chauffeur') {
        filtres.chauffeurId = user.id;
    }
    const trajets = await Trajet.find(filtres)
        .populate('chauffeurId', 'nom prenom email')
        .populate('camionId', 'immatriculation marque modele')
        .populate('remorqueId', 'immatriculation type')
        .sort({ dateDepartPrevue: -1 });

    return trajets;
}

async function getTrajetById(id, user) {
    const trajet = await Trajet.findById(id)
        .populate('chauffeurId', 'nom prenom email')
        .populate('camionId', 'immatriculation marque modele')
        .populate('remorqueId', 'immatriculation type');
    if (!trajet) {
        throw new ApiError('Trajet introuvable', 404);
    }
    if (user.role === 'chauffeur' && trajet.chauffeurId._id.toString() !== user.id.toString()) {
        throw new ApiError('Accès non autorisé à ce trajet', 403);
    }
    return trajet;
}

async function cloturerTrajet(trajetId, saisieData, user) {
    const trajet = await Trajet.findById(trajetId);
    if (!trajet) {
        throw new ApiError('Trajet Not Found', 404);
    }
    if (user.role === 'chauffeur' && trajet.chauffeurId.toString() !== user.id.toString()) {
        throw new ApiError("you don't have access", 403)
    }
    if (trajet.statut === 'termine') {
        throw new ApiError('trajet deja termine', 409);
    }
    if (saisieData.kilometrageArrivee <= saisieData.kilometrageDepart) {
        throw new ApiError('Bad request', 400);
    }

    const distance = saisieData.kilometrageArrivee - saisieData.kilometrageDepart;
    let consommationMoyenne = 0;
    if (distance > 0 && saisieData.volumeGasoil > 0) {
        consommationMoyenne = Number(((saisieData.volumeGasoil / distance) * 100).toFixed(2));
    }

    trajet.kilometrageDepart = saisieData.kilometrageDepart;
    trajet.kilometrageArrivee = saisieData.kilometrageArrivee;
    trajet.volumeGasoil = saisieData.volumeGasoil;
    trajet.coutGasoil = saisieData.coutGasoil || 0;
    trajet.remarques = saisieData.remarques || '';
    trajet.consommationMoyenne = consommationMoyenne;
    trajet.statut = 'termine';
    await trajet.save();

    await Camion.findByIdAndUpdate(trajet.camionId, {
        statut: 'disponible',
        kilometrageActuel: saisieData.kilometrageArrivee
    });
}

module.exports = {
    createTrajet,
    getAllTrajet,
    getTrajetById,
    cloturerTrajet
}