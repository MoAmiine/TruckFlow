const ApiError = require("../utils/apiError");

function calculerDistance(kmDepart, kmArrivee) {
    if (kmDepart >= kmArrivee) {
        throw new ApiError("Le kilométrage d'arrivée ne peut pas être inférieur au départ")
    }
    return kmArrivee - kmDepart;
}

function calculerConsommationMoyenne(volume, distance) {
    if (!distance || distance <= 0 || !volume || volume <= 0) {
        return 0;
    }
    const consommation = (volume * 100) / distance;
    return Number(consommation.toFixed(2));
}

module.exports = {
    calculerDistance,
    calculerConsommationMoyenne
}