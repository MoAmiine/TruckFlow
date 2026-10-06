const remorqueService = require('../services/remorque.service');

async function createRemorque(req, res, next) {
  try {
    const remorque = await remorqueService.createRemorque(req.body);
    res.status(201).json({ status: 'success', data: remorque });
  } catch (err) {
    next(err);
  }
}

async function getAllRemorques(req, res, next) {
  try {
    const remorques = await remorqueService.getAllRemorques();
    res.status(200).json({ status: 'success', results: remorques.length, data: remorques });
  } catch (err) {
    next(err);
  }
}

async function getRemorqueById(req, res, next) {
  try {
    const remorque = await remorqueService.getRemorqueById(req.params.id);
    res.status(200).json({ status: 'success', data: remorque });
  } catch (err) {
    next(err);
  }
}

async function updateRemorque(req, res, next) {
  try {
    const newRemorque = await remorqueService.updateRemorque(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: newRemorque });
  } catch (err) {
    next(err);
  }
}

async function archiverRemorque(req, res, next) {
  try {
    const remorque = await remorqueService.archiverRemorque(req.params.id);
    res.status(200).json({ status: 'success', message: 'Remorque archivée avec succès', data: remorque });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRemorque,
  getAllRemorques,
  getRemorqueById,
  updateRemorque,
  archiverRemorque
};