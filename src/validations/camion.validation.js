const Joi = require('joi');

const createCamionSchema = Joi.object({
  immatriculation: Joi.string().trim().required(),
  marque: Joi.string().trim().required(),
  modele: Joi.string().trim().required(),
  kilometrageActuel: Joi.number().min(0).default(0),
  seuilVidangeKm: Joi.number().min(0).default(10000),
  seuilRevisionKm: Joi.number().min(0).default(30000)
});

module.exports = {
  createCamionSchema
};