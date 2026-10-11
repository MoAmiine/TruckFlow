const User = require('../models/User');
const Camion = require('../models/Camion');
const Remorque = require('../models/Remorque');
const Pneu = require('../models/Pneu');
const Trajet = require('../models/Trajet');
const ApiError = require('../utils/apiError');

async function verifierDisponibilite(camionId, remorqueId, chauffeurId, dateDebut, dateFin, trajetIdAExclure = null) {
    const camion = await Camion.findById(camionId);
    const remorque = await Remorque.findById(remorqueId);
    const chauffeur = await User.findById(chauffeurId);
    const pneuAlerte = await Pneu.findOne({ camionId, etat: 'a_remplacer' });
    const chauffeurOccupe = await Trajet.findOne({
        chauffeurId,
        statut: { $in: ['a_faire', 'en_cours'] },
        dateDepartPrevue: { $lte: new Date(dateFin) },
        dateArriveePrevue: { $gte: new Date(dateDebut) }
    });
    const camionOccupe = await Trajet.findOne({
        camionId,
        statut: { $in: ['a_faire', 'en_cours'] },
        dateDepartPrevue: { $lte: new Date(dateFin) },
        dateArriveePrevue: { $gte: new Date(dateDebut) }
    });
    const remorqueOccupee = await Trajet.findOne({
        remorqueId,
        statut: { $in: ['a_faire', 'en_cours'] },
        dateDepartPrevue: { $lte: new Date(dateFin) },
        dateArriveePrevue: { $gte: new Date(dateDebut) }
    });

    if (!chauffeur) {
        throw new ApiError('chauffeur introuvable', 404)
    }
    if (chauffeur.statut === 'suspendu') {
        throw new ApiError('chauffeur suspendu', 400);
    }
    if (chauffeurOccupe) {
        throw new ApiError('Chauffeur déjà occupé sur cette période', 409);
    }

    if (!camion) {
        throw new ApiError('camion introuvable', 404);
    }
    if (camion.statut === 'archive' || camion.statut === 'maintenance') {
        throw new ApiError('Camion en maintenance ou archivé', 409)
    }
    if (camionOccupe) {
        throw new ApiError('Camion déjà assigné sur cette période', 409);
    }
    if (pneuAlerte) {
        throw new ApiError('Le camion possède au moins un pneu à remplacer avant assignation !', 409);
    }

    if (!remorque) {
        throw new ApiError('remorque introuvable', 404);
    }
    if (remorque.statut === 'archive' || remorque.statut === 'maintenance') {
        throw new ApiError('Remorque en maintenance ou archivé', 409)
    }
    if (remorqueOccupee) {
        throw new ApiError('Remorque déjà assignée sur cette période', 409);
    }
    return true;
}

module.exports = { verifierDisponibilite };