const Trajet = require('../models/Trajet');
const Pneu = require('../models/Pneu');
const Camion = require('../models/Camion');

/**
 * 2.1 Scoring d'Éco-Conduite & Performance Chauffeur
 * GET /api/v2/analytics/drivers/eco-performance
 */
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
                            totalDistanceKm: { $round: ['$totalDistance', 2] },
                            totalGasoilLitres: { $round: ['$totalGasoil', 2] },
                            consommationMoyenne: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ['$totalGasoil', '$totalDistance'] },
                                            100
                                        ]
                                    },
                                    2
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
                                            0,
                                            {
                                                $min: [
                                                    100,
                                                    {
                                                        $subtract: [
                                                            100,
                                                            {
                                                                $multiply: [
                                                                    { $subtract: ['$consommationMoyenne', 30] },
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
                            totalDistanceKm: { $round: ['$totalDistanceFlotte', 2] },
                            totalGasoilLitres: { $round: ['$totalGasoilFlotte', 2] },
                            consommationMoyenneFlotte: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ['$totalGasoilFlotte', '$totalDistanceFlotte'] },
                                            100
                                        ]
                                    },
                                    2
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

async function getTiresHealthMatrix() {
    const PRIX_UNITAIRE_PNEU = 3500; 

    const result = await Pneu.aggregate([
        {
            $addFields: {
                tauxUsure: {
                    $min: [
                        100,
                        {
                            $multiply: [
                                {
                                    $divide: [
                                        '$kilometrageActuel',
                                        { $cond: [{ $gt: ['$seuilUsureKm', 0] }, '$seuilUsureKm', 40000] }
                                    ]
                                },
                                100
                            ]
                        }
                    ]
                }
            }
        },
        {
            $facet: {
                tranches: [
                    {
                        $bucket: {
                            groupBy: '$tauxUsure',
                            boundaries: [0, 50, 80, 101],
                            default: 'Hors_Limite',
                            output: {
                                totalPneus: { $sum: 1 },
                                tauxMoyenUsure: { $avg: '$tauxUsure' },
                                pneus: {
                                    $push: {
                                        _id: '$_id',
                                        numeroSerie: '$numeroSerie',
                                        position: '$position',
                                        camionId: '$camionId',
                                        kilometrageActuel: '$kilometrageActuel',
                                        seuilUsureKm: '$seuilUsureKm',
                                        etat: '$etat',
                                        tauxUsure: { $round: ['$tauxUsure', 1] }
                                    }
                                }
                            }
                        }
                    }
                ],
                parEssieuPosition: [
                    {
                        $group: {
                            _id: { $ifNull: ['$position', 'stock'] },
                            totalPneus: { $sum: 1 },
                            tauxMoyenUsure: { $avg: '$tauxUsure' },
                            pneusCritiques: {
                                $sum: { $cond: [{ $gte: ['$tauxUsure', 80] }, 1, 0] }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            position: '$_id',
                            totalPneus: 1,
                            pneusCritiques: 1,
                            tauxMoyenUsure: { $round: ['$tauxMoyenUsure', 1] }
                        }
                    },
                    { $sort: { pneusCritiques: -1 } }
                ],
                resumeFlotte: [
                    {
                        $group: {
                            _id: null,
                            totalPneus: { $sum: 1 },
                            critiques: {
                                $sum: { $cond: [{ $gte: ['$tauxUsure', 80] }, 1, 0] }
                            },
                            alerte: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $gte: ['$tauxUsure', 50] },
                                                { $lt: ['$tauxUsure', 80] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            bons: {
                                $sum: { $cond: [{ $lt: ['$tauxUsure', 50] }, 1, 0] }
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const data = result[0] || {};
    const resume = (data.resumeFlotte && data.resumeFlotte[0]) || {
        totalPneus: 0,
        critiques: 0,
        alerte: 0,
        bons: 0
    };

    const bucketsFormatted = (data.tranches || []).map((b) => {
        let tranche = 'Bon état [0 - 50%[';
        let niveauRisque = 'FAIBLE';
        if (b._id === 50) {
            tranche = 'Surveillance / Alerte [50 - 80%[';
            niveauRisque = 'MODERE';
        } else if (b._id === 80) {
            tranche = 'Critique / À Remplacer [80 - 100%]';
            niveauRisque = 'ELEVE';
        }
        return {
            borneInferieure: b._id,
            tranche,
            niveauRisque,
            totalPneus: b.totalPneus,
            tauxMoyenUsure: Number(b.tauxMoyenUsure.toFixed(1)),
            pneus: b.pneus
        };
    });

    const budgetPrevisionnelDH = resume.critiques * PRIX_UNITAIRE_PNEU;

    return {
        resumeFlotte: {
            totalPneus: resume.totalPneus,
            pneusCritiques: resume.critiques,
            pneusAlerte: resume.alerte,
            pneusBons: resume.bons
        },
        projectionBudgetaire: {
            prixUnitaireMoyenDH: PRIX_UNITAIRE_PNEU,
            pneusARemplacerImmediatement: resume.critiques,
            budgetPrevisionnelTotalDH: budgetPrevisionnelDH
        },
        repartitionTranches: bucketsFormatted,
        matriceParPosition: data.parEssieuPosition || []
    };
}

/**
 * 2.3 Rentabilité Financière des Lignes & Bilan Énergétique ESG (CO2)
 * GET /api/v2/analytics/trips/financial-esg
 */
async function getTripsFinancialEsg(filters = {}) {
    const matchStage = {
        statut: 'termine',
        volumeGasoil: { $gt: 0 },
        kilometrageArrivee: { $ne: null },
        kilometrageDepart: { $ne: null },
        $expr: { $gt: ['$kilometrageArrivee', '$kilometrageDepart'] }
    };

    if (filters.startDate || filters.endDate) {
        matchStage.dateDepartPrevue = {};
        if (filters.startDate) matchStage.dateDepartPrevue.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.dateDepartPrevue.$lte = new Date(filters.endDate);
    }

    const result = await Trajet.aggregate([
        { $match: matchStage },
        {
            $addFields: {
                distanceKm: { $subtract: ['$kilometrageArrivee', '$kilometrageDepart'] },
                coutReelGasoil: {
                    $cond: [
                        { $gt: ['$coutGasoil', 0] },
                        '$coutGasoil',
                        { $multiply: ['$volumeGasoil', 13.5] } // prix moyen standard ~13.5 DH/L si non saisi
                    ]
                }
            }
        },
        {
            $facet: {
                parLigne: [
                    {
                        $group: {
                            _id: {
                                siteDepart: '$siteDepart',
                                siteArrivee: '$siteArrivee'
                            },
                            totalTrajets: { $sum: 1 },
                            totalDistanceKm: { $sum: '$distanceKm' },
                            totalGasoilLitres: { $sum: '$volumeGasoil' },
                            totalCoutGasoilDH: { $sum: '$coutReelGasoil' }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            corridor: {
                                $concat: ['$_id.siteDepart', ' ➔ ', '$_id.siteArrivee']
                            },
                            siteDepart: '$_id.siteDepart',
                            siteArrivee: '$_id.siteArrivee',
                            totalTrajets: 1,
                            totalDistanceKm: { $round: ['$totalDistanceKm', 2] },
                            totalGasoilLitres: { $round: ['$totalGasoilLitres', 2] },
                            totalCoutGasoilDH: { $round: ['$totalCoutGasoilDH', 2] },
                            consommationMoyenneL100: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ['$totalGasoilLitres', '$totalDistanceKm'] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            // Formule ADEME : ECO2 (tonnes) = (L * 2.68) / 1000
                            emissionsCO2Tonnes: {
                                $round: [
                                    {
                                        $divide: [
                                            { $multiply: ['$totalGasoilLitres', 2.68] },
                                            1000
                                        ]
                                    },
                                    3
                                ]
                            }
                        }
                    },
                    { $sort: { totalTrajets: -1 } }
                ],
                bilanGlobal: [
                    {
                        $group: {
                            _id: null,
                            totalTrajets: { $sum: 1 },
                            totalDistanceKm: { $sum: '$distanceKm' },
                            totalGasoilLitres: { $sum: '$volumeGasoil' },
                            totalCoutGasoilDH: { $sum: '$coutReelGasoil' }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalTrajets: 1,
                            totalDistanceKm: { $round: ['$totalDistanceKm', 2] },
                            totalGasoilLitres: { $round: ['$totalGasoilLitres', 2] },
                            totalCoutGasoilDH: { $round: ['$totalCoutGasoilDH', 2] },
                            emissionsCO2Tonnes: {
                                $round: [
                                    {
                                        $divide: [
                                            { $multiply: ['$totalGasoilLitres', 2.68] },
                                            1000
                                        ]
                                    },
                                    3
                                ]
                            },
                            consommationMoyenneFlotte: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ['$totalGasoilLitres', '$totalDistanceKm'] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const data = result[0] || {};
    return {
        bilanGlobal: (data.bilanGlobal && data.bilanGlobal[0]) || {
            totalTrajets: 0,
            totalDistanceKm: 0,
            totalGasoilLitres: 0,
            totalCoutGasoilDH: 0,
            emissionsCO2Tonnes: 0,
            consommationMoyenneFlotte: 0
        },
        lignesLogistiques: data.parLigne || []
    };
}

/**
 * 2.4 Taux d'Utilisation & Temps d'Immobilisation de la Flotte
 * GET /api/v2/analytics/fleet/utilization-trends
 * Formule : tau_utilisation = Tmission / (Tdisponible + Tmaintenance)
 */
async function getFleetUtilizationTrends() {
    const result = await Camion.aggregate([
        {
            $match: {
                statut: { $ne: 'archive' }
            }
        },
        {
            $facet: {
                repartitionStatuts: [
                    {
                        $group: {
                            _id: '$statut',
                            nombreCamions: { $sum: 1 },
                            totalKmParcourus: { $sum: '$kilometrageActuel' }
                        }
                    }
                ],
                statistiquesGlobales: [
                    {
                        $group: {
                            _id: null,
                            totalCamions: { $sum: 1 },
                            enMission: {
                                $sum: { $cond: [{ $eq: ['$statut', 'en_mission'] }, 1, 0] }
                            },
                            disponible: {
                                $sum: { $cond: [{ $eq: ['$statut', 'disponible'] }, 1, 0] }
                            },
                            enMaintenance: {
                                $sum: { $cond: [{ $eq: ['$statut', 'maintenance'] }, 1, 0] }
                            },
                            totalKmFlotte: { $sum: '$kilometrageActuel' },
                            kmMoyenParCamion: { $avg: '$kilometrageActuel' }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalCamions: 1,
                            enMission: 1,
                            disponible: 1,
                            enMaintenance: 1,
                            totalKmFlotte: { $round: ['$totalKmFlotte', 2] },
                            kmMoyenParCamion: { $round: ['$kmMoyenParCamion', 2] },
                            // Formule : Tmission / (Tdisponible + Tmaintenance)
                            tauxUtilisation: {
                                $cond: [
                                    { $gt: [{ $add: ['$disponible', '$enMaintenance'] }, 0] },
                                    {
                                        $round: [
                                            {
                                                $multiply: [
                                                    {
                                                        $divide: [
                                                            '$enMission',
                                                            { $add: ['$disponible', '$enMaintenance'] }
                                                        ]
                                                    },
                                                    100
                                                ]
                                            },
                                            2
                                        ]
                                    },
                                    0
                                ]
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const data = result[0] || {};
    const stats = (data.statistiquesGlobales && data.statistiquesGlobales[0]) || {
        totalCamions: 0,
        enMission: 0,
        disponible: 0,
        enMaintenance: 0,
        totalKmFlotte: 0,
        kmMoyenParCamion: 0,
        tauxUtilisation: 0
    };

    return {
        tauxUtilisationFlottePourcentage: stats.tauxUtilisation,
        formuleAppliquee: 'Tmission / (Tdisponible + Tmaintenance)',
        statistiquesActuelles: stats,
        repartitionParStatut: (data.repartitionStatuts || []).map((item) => ({
            statut: item._id,
            nombreCamions: item.nombreCamions,
            totalKmParcourus: item.totalKmParcourus
        }))
    };
}

module.exports = {
    getDriversEcoPerformance,
    getTiresHealthMatrix,
    getTripsFinancialEsg,
    getFleetUtilizationTrends
};
