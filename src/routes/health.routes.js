const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

router.get('/liveness', healthController.checkLiveness);
router.get('/readiness', healthController.checkReadiness);

module.exports = router;
