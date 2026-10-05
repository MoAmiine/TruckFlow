const Camion = require('../models/Camion');
const ApiError = require('../utils/apiError');

async function createCamion(data){
    const usedIm = await Camion.findOne({immatriculation: data.immatriculation})
    if(usedIm){
        throw new ApiError('registration number alreadu used !', 400)
    }
    const camion = await Camion.create(data);
    return camion;
}

async function getAllCamion(filtre){
    const camions = await Camion.find({statut: {$ne: 'archive'}});
    return camions;
}

async function getCamionById(id){
    const camion = await Camion.findById(id);
    if(!camion){ 
        throw new ApiError('truck not found !', 404)
    }
    return camion;
}

async function updateCamion(id, data){
    const newCamion = await Camion.findByIdAndUpdate(id, data, {new: true, runValidators: true});
    return newCamion;
}

async function archiverCamion(id){
    const camion = await Camion.findByIdAndUpdate(id, { statut: 'archive' }, {new: true});
    return camion;
}

module.exports = {
    createCamion,
    getAllCamion,
    getCamionById,
    updateCamion,
    archiverCamion
}