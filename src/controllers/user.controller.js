const userService = require('../services/user.service');

async function createChauffeur(req, res, next) {
    try {
        const chauffeur = await userService.createChauffeur(req.body);
        res.status(201).json({ status: 'success', data: chauffeur });
    } catch (err) {
        next(err);
    }
}

async function getAllChauffeurs(req, res, next) {
    try {
        const chauffeurs = await userService.getAllChauffeurs();
        res.status(200).json({ status: 'success', results: chauffeurs.length, data: chauffeurs });
    } catch (err) {
        next(err);
    }
}

async function getAllUsers(req, res, next) {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ status: 'success', results: users.length, data: users });
    } catch (err) {
        next(err);
    }
}

async function getUserById(req, res, next) {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({ status: 'success', data: user });
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: user });
    } catch (err) {
        next(err);
    }
}

async function changerStatutChauffeur(req, res, next) {
    const { id } = req.params;
    const { statut } = req.body;
    try {
        const user = await userService.changerStatutChauffeur(id, statut);
        res.status(200).json({ status: 'success', userId: id, updatedData: user });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createChauffeur,
    getAllChauffeurs,
    getAllUsers,
    getUserById,
    updateUser,
    changerStatutChauffeur
};
