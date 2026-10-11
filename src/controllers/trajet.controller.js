const trajetService = require('../services/trajet.service');

async function createTrajet(req, res, next) {
  try {
    const trajet = await trajetService.createTrajet(req.body);
    res.status(201).json({
      status: 'success',
      data: trajet
    });
  } catch (err) {
    next(err);
  }
}

async function getAllTrajets(req, res, next) {
  try {
    const trajets = await trajetService.getAllTrajet(req.query, req.user);
    res.status(200).json({
      status: 'success',
      results: trajets.length,
      data: trajets
    });
  } catch (err) {
    next(err);
  }
}

async function getTrajetById(req, res, next) {
  try {
    const trajet = await trajetService.getTrajetById(req.params.id, req.user);
    res.status(200).json({
      status: 'success',
      data: trajet
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTrajet,
  getAllTrajets,
  getTrajetById
};