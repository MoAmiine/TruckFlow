const Joi = require('joi');
const createPneuSchema = Joi.object({
  numeroSerie: Joi.string().trim().required(),
  seuilUsureKm: Joi.number().min(0).default(40000)
});
const associerPneuSchema = Joi.object({
  camionId: Joi.string().hex().length(24).required(),
  position: Joi.string().required()
});
module.exports = { createPneuSchema, associerPneuSchema };