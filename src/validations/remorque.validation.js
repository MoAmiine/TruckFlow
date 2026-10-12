const Joi = require('joi');

const createRemorqueSchema = Joi.object({
  immatriculation: Joi.string().trim().required(),
  type: Joi.string().valid('citerne', 'plateau', 'benne', 'frigo').required(),
  capaciteCharge: Joi.number().positive().required(),
  kilometrageActuel: Joi.number().min(0).default(0)
});

module.exports = {
  createRemorqueSchema
};