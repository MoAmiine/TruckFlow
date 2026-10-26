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

pneuSchema.index({ camionId: 1, etat: 1 });
pneuSchema.index({ kilometrageActuel: 1, seuilUsureKm: 1 });

module.exports = mongoose.model('Pneu', pneuSchema);