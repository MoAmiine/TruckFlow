const Pneu = require('../models/Pneu');
const Camion = require('../models/Camion');
const ApiError = require('../utils/apiError');

async function createPneu(data){
    const usedNum = await Pneu.findOne({ numeroSerie: data.numeroSerie });
    if(usedNum){
        throw new ApiError('Numéro de série déjà utilisé', 400)
    }
    const newPneu = await Pneu.create(data);
    return newPneu; 
}

async function getAllPneus(filters = {}){
    const pneus = await Pneu.find(filters).populate('camionId')
    return pneus; 
}

async function getPneuById(id){
    const pneu = await Pneu.findById(id)
    if(!pneu){
        throw new ApiError('Not Found', 404)
    }
    return pneu;
}

async function associerPneuAuCamion(pneuId, camionId, position){
    const camion = await Camion.findById(camionId);
    const pneu = await Pneu.findById(pneuId);
    if (!camion || !pneu){
        throw new ApiError('Not Found', 404)
    }
    if(pneu.etat === 'a_remplacer' ){
        throw new ApiError("Impossible d'associer ce pneu", 400)
    }
    const positionTaken = await Pneu.findOne({camionId, position})
    if (positionTaken){
        throw new ApiError('Pneu deja occupe', 400)
    }
    pneu.camionId = camionId
    pneu.position = position
    await pneu.save();
    return pneu;
}


async function desassocierPneu(pneuId){
    const pneu = await Pneu.findById(pneuId);
    pneu.camionId = null
    pneu.position = null
    await pneu.save();
    return pneu;
}


module.exports = { 
    createPneu, 
    getAllPneus, 
    getPneuById, 
    associerPneuAuCamion, 
    desassocierPneu 
};
