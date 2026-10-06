const Remorque = require('../models/Remorque');
const ApiError = require('../utils/apiError');

async function createRemorque(data) {
  const usedIm = await Remorque.findOne({ immatriculation: data.immatriculation });
  if (usedIm) {
    throw new ApiError('Immatriculation déjà existante pour cette remorque !', 400);
  }
  const remorque = await Remorque.create(data);
  return remorque;
}

async function getAllRemorques() {
  const remorques = await Remorque.find({ statut: { $ne: 'archive' } });
  return remorques;
}

async function getRemorqueById(id) {
  const remorque = await Remorque.findById(id);
  if (!remorque) {
    throw new ApiError('Remorque non trouvée !', 404);
  }
  return remorque;
}

async function updateRemorque(id, data) {
  const newRemorque = await Remorque.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!newRemorque) {
    throw new ApiError('Remorque non trouvée !', 404);
  }
  return newRemorque;
}

async function archiverRemorque(id) {
  const remorque = await Remorque.findByIdAndUpdate(id, { statut: 'archive' }, { new: true });
  if (!remorque) {
    throw new ApiError('Remorque non trouvée !', 404);
  }
  return remorque;
}

module.exports = {
  createRemorque,
  getAllRemorques,
  getRemorqueById,
  updateRemorque,
  archiverRemorque
};