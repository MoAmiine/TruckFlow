const Pneu = require('../models/Pneu');
const pneuService = require('../services/Pneu.service');


async function createPneu(req, res, next){
    try{
        const pneu = await pneuService.createPneu(req.body);
        res.status(201).json({statut: success, data: pneu})
    }catch(err){
        next(err);
    }
}

async function getAllPneus(req, res, next){
    try{
    const pneus = await pneuService.getAllPneus();
    res.statut(200).json({statut: success, data: pneus});
    }catch(err){
        next(err);
    }
}

async function getPneuById(req, res, next){
    try{
        const pneu = await pneuService.getPneuById(req.params.id);
        res.status(200).json({statut: success, data: pneu});
    }catch(err){
        next(err);
    }
}

async function associerPneuAuCamion(req, res, next){
    try{
    const { id } = req.params;
    const { camionId, position } = req.body
    await pneuService.associerPneuAuCamion(id, camionId, position);
    res.status(200).json({statut: success, message: 'pneu assigne avec succes'})
    }catch(err){
        next(err);
    }
}

async function desassocierPneu(req, res, next){
    try{
        const pneu = await pneuService.desassocierPneu(req.params.id);
        res.status(200).json({statut: 'success', message: 'pneu desassigne avec succes'});
    }catch(err){
        next(err);
    }
}

module.exports = {
    createPneu,
    getAllPneus,
    getPneuById,
    associerPneuAuCamion,
    desassocierPneu
}