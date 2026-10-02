const express = require('express');
const jwt = require('jsonwebtoken');
const users = require('../models/User');

function generateAccessToken(user){
    return jwt.sign(
        {id: user._id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || '1d'}
    );
}

function generateRefreshToken(user){
    return jwt.sign(
        {id:user._id, role: user.role},
        process.env.JWT_REFRESH_SECRET,
        {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'}
    )
}

module.exports = { generateAccessToken, generateRefreshToken };