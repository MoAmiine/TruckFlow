const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(verifyAccessToken);
router.use(restrictTo('admin'))

router.post('/chauffeurs', userController.createChauffeur);
router.get('/chauffeurs', userController.getAllChauffeurs);
router.patch('/chauffeurs/:id/statut', userController.changerStatutChauffeur);

module.exports = router;