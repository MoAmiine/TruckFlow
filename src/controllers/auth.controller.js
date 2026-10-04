const authService = require('../services/auth.service');

async function login(req, res, next){
    try{
        const email = req.body.email
        const password = req.body.password
        const result = await authService.login(email, password)
        res.status(200).json({status: 'success', data: result})
    }catch(err){
        next(err);
    }
}

module.exports = { login }