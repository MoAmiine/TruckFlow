const Camion = require('../models/Camion');
const camionService = require('../services/camion.service')


async function createCamion(req, res, next) {
    try {
        const camion = await camionService.createCamion(req.body);
        res.status(201).json({ statut: 'success', data: camion }); 
    } catch (err) {
        next(err);
    }
}

async function getAllCamions(req, res, next) {
    try {
        const camions = await camionService.getAllCamion();
        res.status(200).json({ status: 'success', data: camions })
    } catch (err) {
        next(err);
    }
}

async function getCamionById(req, res, next) {
    try {
        const camion = await camionService.getCamionById(req.params.id)
        res.status(200).json({ status: 'success', data: camion })
    } catch (err) {
        next(err)
    }
}

async function updateCamion(req, res, next) {
    const { id } = req.params;
    const data = req.body;
    try {
        const newCamion = await camionService.updateCamion(id, data)
        res.status(200).json({ statut: 'success', camion: newCamion })
    } catch (err) {
        next(err)
    }
}

async function archiverCamion(req, res, next) {
    try {
        const camion = await camionService.archiverCamion(req.params.id)
        res.status(200).json({ statut: 'success', CamionArchive: camion })
    }catch(err){
        next(err)
    }
}

module.exports = {
    createCamion,
    getAllCamions,
    getCamionById,
    updateCamion,
    archiverCamion
}