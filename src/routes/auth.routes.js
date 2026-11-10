const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/refresh', authController.refreshToken);
router.get('/me', verifyAccessToken, authController.getMe);
router.post('/logout', verifyAccessToken, authController.logout);

module.exports = router;
