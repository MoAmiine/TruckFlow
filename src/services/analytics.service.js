const Trajet = require('../models/Trajet');

async function getDriversEcoPerformance() {
    const result = await Trajet.aggregate([
        {
            $match: {
                statut: 'termine',
                kilometrageArrivee: { $ne: null },
                kilometrageDepart: { $ne: null },
                volumeGasoil: { $gt: 0 },
                $expr: { $gt: ['$kilometrageArrivee', '$kilometrageDepart'] }
            }
        },
        {
            $addFields: {
                distanceTrajet: { $subtract: ['$kilometrageArrivee', '$kilometrageDepart'] }
            }
        },
        {
            $facet: {
                drivers: [
                    {
                        $group: {
                            _id: '$chauffeurId',
                            totalTrajets: { $sum: 1 },
                            totalGasoil: { $sum: '$volumeGasoil' },
                            totalDistance: { $sum: '$distanceTrajet' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'chauffeur'
                        }
                    },
                    { $unwind: '$chauffeur' },
                    {
                        $project: {
                            _id: 1,
                            nom: '$chauffeur.nom',
                            prenom: '$chauffeur.prenom',
                            email: '$chauffeur.email',
                            totalTrajets: 1,
                            totalDistancekm: { $round: ['$totalDistance', 2] },
                            totalGasoilLitres: { $round: ['$totalGasoil', 2] },
                            consommationMoyenne: {
                                $round: [{
                                    $multiply: [
                                        { $divide: ['$totalGasoil', '$totalDistance'] }, 100
                                    ]
                                }, 2
                                ]
                            }

                        }
                    },
                    {
                        $addFields: {
                            ecoScore: {
                                $round: [
                                    {
                                        $max: [
                                            0, {
                                                $min: [
                                                    100, {
                                                        $subtract : [
                                                            100, {
                                                                $multiply: [
                                                                    { $subtract : ['$consommationMoyenne', 30] },
                                                                    2.5
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    2
                                ]
                            }
                        }
                    },
                    { $sort: { ecoScore: -1 } }
                ],
                fleetOverview: [
                    {
                        $group: {
                            _id: null,
                            totalTrajetsFlotte: { $sum: 1 },
                            totalGasoilFlotte: { $sum: '$volumeGasoil' },
                            totalDistanceFlotte: { $sum: '$distanceTrajet' }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalTrajetsFlotte: 1,
                            totalDistancekm: { $round: ['$totalDistanceFlotte', 2] },
                            totalGasoilLitres: { $round: ['$totalGasoilFlotte', 2] },
                            consommationMoyenneFlotte: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ['$totalGasoilFlotte', '$totalDistanceFlotte'] },
                                            100
                                        ]
                                    }, 2
                                ]
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const output = result[0] || { drivers: [], fleetOverview: [] };
    return {
        fleetOverview: output.fleetOverview[0] || {
            totalTrajetsFlotte: 0,
            totalDistanceKm: 0,
            totalGasoilLitres: 0,
            consommationMoyenneFlotte: 0
        },
        drivers: output.drivers
    };
}

module.exports = {
    getDriversEcoPerformance
}