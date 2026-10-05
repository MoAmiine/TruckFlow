const User = require('../models/User');
const userService = require('../services/user.service');

async function createChauffeur(req, res, next) {
    try {
        const chauffeur = await userService.createChauffeur(req.body);
        res.status(201).json({ status: 'success', data: chauffeur })
    } catch (err) {
        next(err);
    }
}

async function getAllChauffeurs(req, res, next) {
    try {
        const chauffeurs = await userService.getAllChauffeurs()
        res.status(200).json({ status: 'success', result: chauffeurs.length, data: chauffeurs })

    }
    catch (err) {
        next(err)
    }
}

async function changerStatutChauffeur(req, res, next) {
    const { id } = req.params;
    const { statut } = req.body;
    try {
        const chauffeur = await userService.changerStatutChauffeur(id, statut);
        res.status(200).json({ status: 'success', userId: id, updatedData: chauffeur });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createChauffeur,
    getAllChauffeurs,
    changerStatutChauffeur
}