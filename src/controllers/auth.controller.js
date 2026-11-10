const authService = require('../services/auth.service');

async function login(req, res, next) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const result = await authService.login(email, password);
        res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
}

async function register(req, res, next) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
}

async function getMe(req, res, next) {
    try {
        const user = await authService.getMe(req.user.id);
        res.status(200).json({ status: 'success', data: user });
    } catch (err) {
        next(err);
    }
}

async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);
        res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        await authService.logout(req.user.id);
        res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
    } catch (err) {
        next(err);
    }
}

module.exports = { 
    login, 
    register, 
    getMe, 
    refreshToken, 
    logout 
};
