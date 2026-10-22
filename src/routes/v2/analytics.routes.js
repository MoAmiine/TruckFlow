const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analytics.controller');
const { verifyAccessToken } = require('../../middlewares/auth.middleware');
const { restrictTo } = require('../../middlewares/role.middleware');
const { analyticsLimiter } = require('../../middlewares/rateLimit.middleware');


router.use(verifyAccessToken);
router.use(restrictTo('admin'));
router.use(analyticsLimiter);

router.get('/drivers/eco-performance', analyticsController.getDriversEcoPerformance);

module.exports = router;