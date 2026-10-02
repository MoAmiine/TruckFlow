const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  motDePasse: {
    type: String,
    required: true, 
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'chauffeur'],
    default: 'chauffeur'
  },
  statut: {
    type: String,
    enum: ['actif', 'suspendu'],
    default: 'actif'
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function(){
    if(!this.isModified('motDePasse')){
        return
    }
    this.motDePasse = await bcrypt.hash(this.motDePasse,10);
})

userSchema.methods.comparerMotDePasse = async function(typedPass){
    return bcrypt.compare(typedPass, this.motDePasse);
}

module.exports = mongoose.model('User', userSchema);