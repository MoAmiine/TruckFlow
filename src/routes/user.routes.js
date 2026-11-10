const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(verifyAccessToken);
router.use(restrictTo('admin'));

// Routes spécifiques Chauffeurs (rétrocompatibilité OpenAPI Sprint 1)
router.post('/chauffeurs', userController.createChauffeur);
router.get('/chauffeurs', userController.getAllChauffeurs);
router.patch('/chauffeurs/:id/statut', userController.changerStatutChauffeur);

// Routes Générales Utilisateurs (Admin & Chauffeurs pour Frontend US02/US04)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id/statut', userController.changerStatutChauffeur);

module.exports = router;
