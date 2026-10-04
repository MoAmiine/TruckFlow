const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.util');

async function login(email, password) {

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError('email or password incorrect', 401)
    }

    const samePass = await user.comparerMotDePasse(password);
    if (!samePass) {
        throw new ApiError('email or password incorrect', 401);
    }

    if (user.statut === 'suspendu') {
        throw new ApiError('Your account is suspended', 403)
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        refreshToken: refreshToken,
        accessToken: accessToken
    }
}

async function register(userData) {
    const usedEmail = await User.findOne({ email });
    if (usedEmail) {
        throw new ApiError('email already used', 400)
    }
    const newUser = await User.create(userData)

    return {
        id: newUser._id,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        role: newUser.role
    }
}

module.exports = { login, register }