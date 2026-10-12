const express = require('express');
const router = express.Router();
const trajetController = require('../controllers/trajet.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(verifyAccessToken);

router.post('/', restrictTo('admin'), trajetController.createTrajet);

router.get('/', trajetController.getAllTrajets);
router.get('/:id', trajetController.getTrajetById);

module.exports = router;