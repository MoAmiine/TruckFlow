const Joi = require('joi');

const createTrajetSchema = Joi.object({
  siteDepart: Joi.string().trim().required(),
  siteArrivee: Joi.string().trim().required(),
  marchandise: Joi.string().trim().required(),
  dateDepartPrevue: Joi.date().iso().required(),
  dateArriveePrevue: Joi.date().iso().greater(Joi.ref('dateDepartPrevue')).required()
    .messages({ 'date.greater': "La date d'arrivée doit être après la date de départ !" }),
  chauffeurId: Joi.string().hex().length(24).required(),
  camionId: Joi.string().hex().length(24).required(),
  remorqueId: Joi.string().hex().length(24).required()
});

const cloturerTrajetSchema = Joi.object({
  kilometrageDepart: Joi.number().min(0).required(),
  kilometrageArrivee: Joi.number().min(0).required(),
  volumeGasoil: Joi.number().min(0).required(),
  remarques: Joi.string().allow('', null).default('')
});

module.exports = {
  createTrajetSchema,
  cloturerTrajetSchema
};