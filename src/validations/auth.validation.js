const Joi = require('joi');

const registerSchema = Joi.object({
  nom: Joi.string().trim().required(),
  prenom: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  motDePasse: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'chauffeur').default('chauffeur')
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};