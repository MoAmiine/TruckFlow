const analyticsService = require('../services/analytics.service');

async function getDriversEcoPerformance(req, res, next) {
    try {
        const data = await analyticsService.getDriversEcoPerformance();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        next(err);
    }
}

async function getTiresHealthMatrix(req, res, next) {
    try {
        const data = await analyticsService.getTiresHealthMatrix();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        next(err);
    }
}

async function getTripsFinancialEsg(req, res, next) {
    try {
        const data = await analyticsService.getTripsFinancialEsg(req.query);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        next(err);
    }
}

async function getFleetUtilizationTrends(req, res, next) {
    try {
        const data = await analyticsService.getFleetUtilizationTrends();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getDriversEcoPerformance,
    getTiresHealthMatrix,
    getTripsFinancialEsg,
    getFleetUtilizationTrends
};
