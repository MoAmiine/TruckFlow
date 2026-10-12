const express = require('express');
const router = express.Router();
const pneuController = require('../controllers/pneu.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createPneuSchema, associerPneuSchema } = require('../validations/pneu.validation'); 

router.use(verifyAccessToken);
router.use(restrictTo('admin'));

router.post('/', validate(createPneuSchema), pneuController.createPneu);
router.get('/', pneuController.getAllPneus);
router.get('/:id', pneuController.getPneuById);
router.patch('/:id/associer', validate(associerPneuSchema), pneuController.associerPneuAuCamion);
router.patch('/:id/desassocier', pneuController.desassocierPneu);

module.exports = router;