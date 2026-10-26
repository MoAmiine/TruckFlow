const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analytics.controller');
const { verifyAccessToken } = require('../../middlewares/auth.middleware');
const { restrictTo } = require('../../middlewares/role.middleware');
const { analyticsLimiter } = require('../../middlewares/rateLimit.middleware');

// Protection globale de toutes les routes analytics (Admin only + Rate Limit 20 req/min)
router.use(verifyAccessToken);
router.use(restrictTo('admin'));
router.use(analyticsLimiter);

// 2.1 Scoring d'Éco-Conduite & Performance Chauffeur
router.get('/drivers/eco-performance', analyticsController.getDriversEcoPerformance);

// 2.2 Matrice Prédictive d'Usure des Pneumatiques & Risque Flotte
router.get('/tires/health-matrix', analyticsController.getTiresHealthMatrix);

// 2.3 Rentabilité Financière des Lignes & Bilan Énergétique ESG (CO2)
router.get('/trips/financial-esg', analyticsController.getTripsFinancialEsg);

// 2.4 Taux d'Utilisation & Temps d'Immobilisation de la Flotte
router.get('/fleet/utilization-trends', analyticsController.getFleetUtilizationTrends);

module.exports = router;
