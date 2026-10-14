const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

router.post('/login',validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register); 


module.exports = router