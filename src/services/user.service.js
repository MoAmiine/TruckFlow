const express = require('express')
const User = require('../models/User');
const ApiError = require('../utils/apiError');

async function createChauffeur(data){
    const usedEmail = await User.findOne({ email: data.email });
    if(usedEmail){
        throw new ApiError('email already used', 400)
    }
    return await User.create({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        motDePasse: data.motDePasse,
        role: 'chauffeur'
    })
}

async function getAllChauffeurs(){
    const chauffeurs = await User.find({ role: 'chauffeur' }).select('-motDePasse -refreshToken')
    return chauffeurs;
}

