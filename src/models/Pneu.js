const mongoose = require('mongoose');

const pneuSchema = new mongoose.Schema(
  {
    numeroSerie: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    position: {
      type: String,
      default: null
    },
    kilometrageActuel: {
      type: Number,
      default: 0
    },
    seuilUsureKm: {
      type: Number,
      default: 40000
    },
    etat: {
      type: String,
      enum: ['neuf', 'bon', 'a_remplacer'],
      default: 'neuf'
    },
    camionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camion',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Pneu', pneuSchema);