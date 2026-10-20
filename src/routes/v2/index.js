const express = require('express');
const router = express.Router()
const trajetController = require('../../controllers/trajet.controller');
const { verifyAccessToken } = require('../../middlewares/auth.middleware');
const { restrictTo } = require('../../middlewares/role.middleware');


router.get('/trips/:id/mission-order-url', verifyAccessToken, restrictTo('admin', 'chauffeur'), trajetController.getMissionOrderUrl);

module.exports = router;