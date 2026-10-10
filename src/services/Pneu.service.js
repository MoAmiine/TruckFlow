const Pneu = require('../models/Pneu');
const Camion = require('../models/Camion');
const ApiError = require('../utils/apiError');

async function createPneu(data){
    const usedNum = Pneu.findOne(data.numeroSerie);
    if(usedNum){
        throw new ApiError('Numéro de série déjà utilisé', 400)
    }
    const newPneu = await Pneu.create(data);
    return newPneu; 
}

async function getAllPneu(filters = {}){
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
