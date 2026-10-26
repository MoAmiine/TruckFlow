const analyticsService = require('../../src/services/analytics.service');
const Trajet = require('../../src/models/Trajet');
const Pneu = require('../../src/models/Pneu');
const Camion = require('../../src/models/Camion');

jest.mock('../../src/models/Trajet');
jest.mock('../../src/models/Pneu');
jest.mock('../../src/models/Camion');

describe('AnalyticsService - Tests Unitaires des Pipelines d’Agrégation Big Data', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDriversEcoPerformance', () => {
        it('doit appeler Trajet.aggregate et retourner le scoring individuel et global', async () => {
            const mockAggResult = [{
                fleetOverview: [{
                    totalTrajetsFlotte: 10,
                    totalDistanceKm: 4500,
                    totalGasoilLitres: 1350,
                    consommationMoyenneFlotte: 30.0
                }],
                drivers: [{
                    _id: 'chauffeur1',
                    nom: 'El Amrani',
                    prenom: 'Omar',
                    totalTrajets: 5,
                    totalDistanceKm: 2500,
                    totalGasoilLitres: 750,
                    consommationMoyenne: 30.0,
                    ecoScore: 100
                }]
            }];
            Trajet.aggregate.mockResolvedValue(mockAggResult);

            const result = await analyticsService.getDriversEcoPerformance();

            expect(Trajet.aggregate).toHaveBeenCalled();
            expect(result.fleetOverview.totalDistanceKm).toBe(4500);
            expect(result.drivers[0].ecoScore).toBe(100);
        });
    });

    describe('getTiresHealthMatrix', () => {
        it('doit agréger les tranches d’usure et projeter le budget prévisionnel (3500 DH/pneu)', async () => {
            const mockTiresResult = [{
                tranches: [
                    { _id: 0, totalPneus: 10, tauxMoyenUsure: 25.5, pneus: [] },
                    { _id: 50, totalPneus: 5, tauxMoyenUsure: 65.0, pneus: [] },
                    { _id: 80, totalPneus: 2, tauxMoyenUsure: 88.0, pneus: [] }
                ],
                parEssieuPosition: [
                    { position: 'avant_gauche', totalPneus: 4, pneusCritiques: 1, tauxMoyenUsure: 50 }
                ],
                resumeFlotte: [{
                    totalPneus: 17,
                    critiques: 2,
                    alerte: 5,
                    bons: 10
                }]
            }];
            Pneu.aggregate.mockResolvedValue(mockTiresResult);

            const result = await analyticsService.getTiresHealthMatrix();

            expect(Pneu.aggregate).toHaveBeenCalled();
            expect(result.resumeFlotte.pneusCritiques).toBe(2);
            // 2 pneus critiques * 3500 DH = 7000 DH
            expect(result.projectionBudgetaire.budgetPrevisionnelTotalDH).toBe(7000);
            expect(result.repartitionTranches).toHaveLength(3);
        });
    });

    describe('getTripsFinancialEsg', () => {
        it('doit calculer les émissions CO2 en tonnes (formule ADEME 2.68 kg/L) et marge financière', async () => {
            const mockEsgResult = [{
                bilanGlobal: [{
                    totalTrajets: 20,
                    totalDistanceKm: 8000,
                    totalGasoilLitres: 2400,
                    totalCoutGasoilDH: 32400,
                    emissionsCO2Tonnes: 6.432, // (2400 * 2.68) / 1000
                    consommationMoyenneFlotte: 30.0
                }],
                parLigne: [{
                    corridor: 'Youssoufia ➔ Casablanca',
                    siteDepart: 'Youssoufia',
                    siteArrivee: 'Casablanca',
                    totalTrajets: 10,
                    totalDistanceKm: 4000,
                    totalGasoilLitres: 1200,
                    totalCoutGasoilDH: 16200,
                    emissionsCO2Tonnes: 3.216,
                    consommationMoyenneL100: 30.0
                }]
            }];
            Trajet.aggregate.mockResolvedValue(mockEsgResult);

            const result = await analyticsService.getTripsFinancialEsg({ startDate: '2026-01-01' });

            expect(Trajet.aggregate).toHaveBeenCalled();
            expect(result.bilanGlobal.emissionsCO2Tonnes).toBe(6.432);
            expect(result.lignesLogistiques[0].corridor).toBe('Youssoufia ➔ Casablanca');
        });
    });

    describe('getFleetUtilizationTrends', () => {
        it('doit appliquer la formule exacte Tmission / (Tdisponible + Tmaintenance)', async () => {
            const mockFleetResult = [{
                repartitionStatuts: [
                    { _id: 'en_mission', nombreCamions: 10, totalKmParcourus: 50000 },
                    { _id: 'disponible', nombreCamions: 15, totalKmParcourus: 30000 },
                    { _id: 'maintenance', nombreCamions: 5, totalKmParcourus: 10000 }
                ],
                statistiquesGlobales: [{
                    totalCamions: 30,
                    enMission: 10,
                    disponible: 15,
                    enMaintenance: 5,
                    totalKmFlotte: 90000,
                    kmMoyenParCamion: 3000,
                    // 10 / (15 + 5) = 10 / 20 = 50%
                    tauxUtilisation: 50.0
                }]
            }];
            Camion.aggregate.mockResolvedValue(mockFleetResult);

            const result = await analyticsService.getFleetUtilizationTrends();

            expect(Camion.aggregate).toHaveBeenCalled();
            expect(result.tauxUtilisationFlottePourcentage).toBe(50.0);
            expect(result.formuleAppliquee).toBe('Tmission / (Tdisponible + Tmaintenance)');
        });
    });
});
