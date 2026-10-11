const Trajet = require('../models/Trajet');
const availabilityService = require('./availability.service');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

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

module.exports = {
    createTrajet,
    getAllTrajet,
    getTrajetById
}