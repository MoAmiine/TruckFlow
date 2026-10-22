const analyticsService = require('../services/analytics.service');

async function getDriversEcoPerformance(req, res, next){
    try{
        const data = await analyticsService.getDriversEcoPerformance();
        res.status(200).json({
            statut: 'sucess',
            data
        });
    }catch(err){
        next(err);
    }
}


module.exports = {
    getDriversEcoPerformance
}