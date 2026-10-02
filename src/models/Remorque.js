const mongoose = require('mongoose');

const remorqueSchema = new mongoose.Schema({
  immatriculation: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['citerne', 'plateau', 'benne', 'frigo']
  },
  capaciteCharge: {
    type: Number,
    required: true
  },
  kilometrageActuel: {
    type: Number,
    default: 0
  },
  statut: {
    type: String,
    enum: ['disponible', 'en_mission', 'maintenance', 'archive'],
    default: 'disponible'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Remorque', remorqueSchema);