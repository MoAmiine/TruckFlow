const Joi = require('joi');
const createChauffeurSchema = Joi.object({
  nom: Joi.string().trim().required(),
  prenom: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  motDePasse: Joi.string().min(6).required()
});
const updateStatutSchema = Joi.object({
  statut: Joi.string().valid('actif', 'suspendu').required()
});
module.exports = { createChauffeurSchema, updateStatutSchema };