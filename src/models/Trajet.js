const mongoose = require('mongoose');

const trajetSchema = new mongoose.Schema(
  {
    siteDepart: {
      type: String,
      required: true,
      trim: true
    },
    siteArrivee: {
      type: String,
      required: true,
      trim: true
    },
    marchandise: {
      type: String,
      required: true,
      trim: true
    },
    dateDepartPrevue: {
      type: Date,
      required: true
    },
    dateArriveePrevue: {
      type: Date,
      required: true
    },
    statut: {
      type: String,
      enum: ['a_faire', 'en_cours', 'termine'],
      default: 'a_faire'
    },
    chauffeurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    camionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camion',
      required: true
    },
    remorqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Remorque',
      required: true
    },

    kilometrageDepart: {
      type: Number,
      default: null
    },
    kilometrageArrivee: {
      type: Number,
      default: null
    },
    volumeGasoil: {
      type: Number,
      default: 0
    },
    coutGasoil: {
      type: Number,
      default: 0
    },
    consommationMoyenne: {
      type: Number,
      default: 0
    },
    remarques: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trajet', trajetSchema);