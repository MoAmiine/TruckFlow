const express = require('express');
const router = express.Router();
const camionController = require('../controllers/camion.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(verifyAccessToken);
router.use(restrictTo('admin'));

router.post('/', camionController.createCamion);
router.get('/', camionController.getAllCamions);
router.get('/:id', camionController.getCamionById);
router.put('/:id/update', camionController.updateCamion);
router.patch('/:id/archive', camionController.archiverCamion);

module.exports = router