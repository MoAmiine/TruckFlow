const mongoose = require('mongoose'); 

const camionSchema = new mongoose.Schema({

    immatriculation: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    marque: {
        type: String,
        required: true
    },

    modele: {
        type: String,
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
    },

    seuilVidangeKm: {
        type: Number,
        default: 10000
    },


    seuilRevisionKm: {
        type: Number,
        default: 30000
    },


    dernierKmVidange: {
        type: Number,
        default: 0
    },


    dernierKmRevision: {
        type: Number,
        default: 0
    },
},

    {timestamps:true}

);

module.exports = mongoose.model('Camion', camionSchema);