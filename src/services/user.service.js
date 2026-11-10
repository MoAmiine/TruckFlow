const User = require('../models/User');
const ApiError = require('../utils/apiError');

async function createChauffeur(data) {
    const usedEmail = await User.findOne({ email: data.email });
    if (usedEmail) {
        throw new ApiError('email already used', 400);
    }
    return await User.create({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        motDePasse: data.motDePasse,
        role: 'chauffeur'
    });
}

async function getAllChauffeurs() {
    const chauffeurs = await User.find({ role: 'chauffeur' }).select('-motDePasse -refreshToken');
    return chauffeurs;
}

async function getAllUsers() {
    const users = await User.find().select('-motDePasse -refreshToken').sort({ createdAt: -1 });
    return users;
}

async function getUserById(id) {
    const user = await User.findById(id).select('-motDePasse -refreshToken');
    if (!user) {
        throw new ApiError('Utilisateur non trouvé !', 404);
    }
    return user;
}

async function updateUser(id, data) {
    // Ne pas écraser motDePasse ou refreshToken via cette route
    const { motDePasse, refreshToken, ...updateData } = data;
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-motDePasse -refreshToken');
    if (!user) {
        throw new ApiError('Utilisateur non trouvé !', 404);
    }
    return user;
}

async function changerStatutChauffeur(id, newStatut) {
    if (!['actif', 'suspendu'].includes(newStatut)) {
        throw new ApiError('Statut invalide. Utilisez actif ou suspendu.', 400);
    }
    const user = await User.findByIdAndUpdate(id, { statut: newStatut }, { new: true }).select('-motDePasse -refreshToken');
    if (!user) {
        throw new ApiError('Utilisateur non trouvé !', 404);
    }
    return user;
}

module.exports = { 
    createChauffeur, 
    getAllChauffeurs, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    changerStatutChauffeur 
};
