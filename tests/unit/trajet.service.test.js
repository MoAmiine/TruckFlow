const trajetService = require('../../src/services/trajet.service');
const Trajet = require('../../src/models/Trajet');
const Camion = require('../../src/models/Camion');
const Remorque = require('../../src/models/Remorque');
const availabilityService = require('../../src/services/availability.service');
const pdfService = require('../../src/services/pdf.service');
const storageService = require('../../src/services/storage.service');
const pneuService = require('../../src/services/Pneu.service');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/Trajet');
jest.mock('../../src/models/Camion');
jest.mock('../../src/models/Remorque');
jest.mock('../../src/services/availability.service');
jest.mock('../../src/services/pdf.service');
jest.mock('../../src/services/storage.service');
jest.mock('../../src/services/Pneu.service');

describe('TrajetService - Tests Unitaires (Cycle de vie, Clôture, Presigned URL)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTrajet', () => {
        it('doit créer un trajet, générer le PDF et téléverser sur MinIO avec métadonnées', async () => {
            availabilityService.verifierDisponibilite.mockResolvedValue(true);
            const mockTrajet = {
                _id: 'trajet123',
                save: jest.fn().mockResolvedValue(true)
            };
            Trajet.create.mockResolvedValue(mockTrajet);

            const populateChain = {
                populate: jest.fn().mockReturnThis()
            };
            // Simulation de la chaîne findById().populate().populate().populate()
            Trajet.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue({ _id: 'trajet123' })
                    })
                })
            });

            pdfService.genererOrdreDeMission.mockResolvedValue(Buffer.from('PDF'));
            storageService.uploadMissionOrder.mockResolvedValue({
                bucket: 'truckflow-documents',
                s3Key: 'orders/2026/TRP-2026-trajet123.pdf',
                sizeBytes: 1024
            });

            const result = await trajetService.createTrajet({
                siteDepart: 'Safi',
                siteArrivee: 'Casablanca'
            });

            expect(availabilityService.verifierDisponibilite).toHaveBeenCalled();
            expect(pdfService.genererOrdreDeMission).toHaveBeenCalled();
            expect(storageService.uploadMissionOrder).toHaveBeenCalled();
            expect(mockTrajet.ordreDeMission).toBeDefined();
            expect(mockTrajet.save).toHaveBeenCalled();
            expect(result).toBe(mockTrajet);
        });
    });

    describe('cloturerTrajet', () => {
        it('doit clôturer le trajet, mettre à jour le camion, la remorque et actualiser les pneus', async () => {
            const mockTrajet = {
                _id: 'trajet1',
                statut: 'en_cours',
                chauffeurId: 'user1',
                camionId: 'camion1',
                remorqueId: 'remorque1',
                save: jest.fn().mockResolvedValue(true)
            };
            Trajet.findById.mockResolvedValue(mockTrajet);
            Camion.findByIdAndUpdate.mockResolvedValue({});
            Remorque.findByIdAndUpdate.mockResolvedValue({});
            pneuService.actualiserKilometragePneus.mockResolvedValue();

            const saisie = {
                kilometrageDepart: 1000,
                kilometrageArrivee: 1500,
                volumeGasoil: 150
            };

            const user = { id: 'user1', role: 'chauffeur' };
            const result = await trajetService.cloturerTrajet('trajet1', saisie, user);

            expect(mockTrajet.statut).toBe('termine');
            expect(mockTrajet.kilometrageDepart).toBe(1000);
            expect(mockTrajet.kilometrageArrivee).toBe(1500);
            expect(pneuService.actualiserKilometragePneus).toHaveBeenCalledWith('camion1', 500);
            expect(Camion.findByIdAndUpdate).toHaveBeenCalledWith('camion1', {
                statut: 'disponible',
                kilometrageActuel: 1500
            });
            expect(result).toBe(mockTrajet);
        });

        it('doit refuser la clôture si l’utilisateur est un autre chauffeur (403)', async () => {
            const mockTrajet = {
                _id: 'trajet1',
                statut: 'en_cours',
                chauffeurId: 'user1'
            };
            Trajet.findById.mockResolvedValue(mockTrajet);

            const userAutre = { id: 'user2', role: 'chauffeur' };

            await expect(
                trajetService.cloturerTrajet('trajet1', { kilometrageDepart: 100, kilometrageArrivee: 200 }, userAutre)
            ).rejects.toThrow(ApiError);
        });
    });

    describe('getMissionOrderUrl', () => {
        it('doit retourner la presigned URL pour le chauffeur assigné ou admin', async () => {
            const mockTrajet = {
                _id: 'trajet1',
                chauffeurId: 'user1',
                ordreDeMission: {
                    s3Key: 'orders/2026/TRP-2026-trajet1.pdf'
                }
            };
            Trajet.findById.mockResolvedValue(mockTrajet);
            storageService.generatePresignedUrl.mockResolvedValue('https://minio.s3/url-signee');

            const result = await trajetService.getMissionOrderUrl('trajet1', { id: 'user1', role: 'chauffeur' });

            expect(result).toHaveProperty('downloadUrl', 'https://minio.s3/url-signee');
            expect(result).toHaveProperty('expiresInSeconds', 900);
        });
    });
});
