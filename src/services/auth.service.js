const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.util');

async function login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError('email or password incorrect', 401);
    }

    const samePass = await user.comparerMotDePasse(password);
    if (!samePass) {
        throw new ApiError('email or password incorrect', 401);
    }

    if (user.statut === 'suspendu') {
        throw new ApiError('Your account is suspended', 403);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        statut: user.statut,
        refreshToken: refreshToken,
        accessToken: accessToken
    };
}

async function register(userData) {
    const usedEmail = await User.findOne({ email: userData.email });
    if (usedEmail) {
        throw new ApiError('email already used', 400);
    }
    const newUser = await User.create(userData);

    return {
        id: newUser._id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        role: newUser.role,
        statut: newUser.statut
    };
}

async function getMe(userId) {
    const user = await User.findById(userId).select('-motDePasse -refreshToken');
    if (!user) {
        throw new ApiError('Utilisateur introuvable', 404);
    }
    return user;
}

async function refreshToken(token) {
    if (!token) {
        throw new ApiError('Refresh token requis', 400);
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new ApiError('Refresh token invalide ou expiré', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
        throw new ApiError('Session révoquée ou invalide', 401);
    }

    if (user.statut === 'suspendu') {
        throw new ApiError('Votre compte est suspendu', 403);
    }

    const newAccessToken = generateAccessToken(user);
    return {
        accessToken: newAccessToken
    };
}

async function logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return true;
}

module.exports = { 
    login, 
    register, 
    getMe, 
    refreshToken, 
    logout 
};
