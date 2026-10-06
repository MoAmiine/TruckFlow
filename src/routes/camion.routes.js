const express = require('express');
const router = express.Router();
const camionController = require('../controllers/camion.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(verifyAccessToken);
router.use(restrictTo);

router.post('/camion', camionController.createCamion);
router.get('/camion', camionController.getAllCamions);
router.get('/camion/:id', camionController.getCamionById);
router.put('/camion/:id/update', camionController.updateCamion);
router.patch('camion/:id', camionController.archiverCamion);

module.exports = router