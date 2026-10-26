const availabilityService = require('../../src/services/availability.service');
const Camion = require('../../src/models/Camion');
const Remorque = require('../../src/models/Remorque');
const User = require('../../src/models/User');
const Pneu = require('../../src/models/Pneu');
const Trajet = require('../../src/models/Trajet');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/Camion');
jest.mock('../../src/models/Remorque');
jest.mock('../../src/models/User');
jest.mock('../../src/models/Pneu');
jest.mock('../../src/models/Trajet');

describe('AvailabilityService - Tests Unitaires (DRY Conflits 409 & Mocks)', () => {
    const validCamionId = '670cfa3b1111111111111111';
    const validRemorqueId = '670cfa3b2222222222222222';
    const validChauffeurId = '670cfa3b3333333333333333';
    const dateDebut = '2026-11-01T08:00:00.000Z';
    const dateFin = '2026-11-01T18:00:00.000Z';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('doit valider la disponibilité si toutes les ressources sont libres et disponibles', async () => {
        Camion.findById.mockResolvedValue({ _id: validCamionId, statut: 'disponible' });
        Remorque.findById.mockResolvedValue({ _id: validRemorqueId, statut: 'disponible' });
        User.findById.mockResolvedValue({ _id: validChauffeurId, statut: 'actif', role: 'chauffeur' });
        Pneu.findOne.mockResolvedValue(null); // aucun pneu à remplacer
        Trajet.findOne.mockResolvedValue(null); // aucun conflit de trajet

        const isDispo = await availabilityService.verifierDisponibilite(
            validCamionId,
            validRemorqueId,
            validChauffeurId,
            dateDebut,
            dateFin
        );

        expect(isDispo).toBe(true);
    });

    it('doit rejeter avec 404 si le chauffeur est introuvable', async () => {
        Camion.findById.mockResolvedValue({ _id: validCamionId, statut: 'disponible' });
        Remorque.findById.mockResolvedValue({ _id: validRemorqueId, statut: 'disponible' });
        User.findById.mockResolvedValue(null);

        await expect(
            availabilityService.verifierDisponibilite(validCamionId, validRemorqueId, validChauffeurId, dateDebut, dateFin)
        ).rejects.toThrow(ApiError);
    });

    it('doit rejeter avec 400 si le chauffeur est suspendu', async () => {
        Camion.findById.mockResolvedValue({ _id: validCamionId, statut: 'disponible' });
        Remorque.findById.mockResolvedValue({ _id: validRemorqueId, statut: 'disponible' });
        User.findById.mockResolvedValue({ _id: validChauffeurId, statut: 'suspendu' });

        await expect(
            availabilityService.verifierDisponibilite(validCamionId, validRemorqueId, validChauffeurId, dateDebut, dateFin)
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('doit rejeter avec 409 si le camion a un pneu à remplacer', async () => {
        Camion.findById.mockResolvedValue({ _id: validCamionId, statut: 'disponible' });
        Remorque.findById.mockResolvedValue({ _id: validRemorqueId, statut: 'disponible' });
        User.findById.mockResolvedValue({ _id: validChauffeurId, statut: 'actif' });
        Pneu.findOne.mockResolvedValue({ _id: 'pneu1', etat: 'a_remplacer' }); // pneu critique !
        Trajet.findOne.mockResolvedValue(null);

        await expect(
            availabilityService.verifierDisponibilite(validCamionId, validRemorqueId, validChauffeurId, dateDebut, dateFin)
        ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('doit rejeter avec 409 en cas de chevauchement temporel du camion', async () => {
        Camion.findById.mockResolvedValue({ _id: validCamionId, statut: 'disponible' });
        Remorque.findById.mockResolvedValue({ _id: validRemorqueId, statut: 'disponible' });
        User.findById.mockResolvedValue({ _id: validChauffeurId, statut: 'actif' });
        Pneu.findOne.mockResolvedValue(null);
        Trajet.findOne.mockImplementation((query) => {
            if (query.camionId) return Promise.resolve({ _id: 'trajetConflit' });
            return Promise.resolve(null);
        });

        await expect(
            availabilityService.verifierDisponibilite(validCamionId, validRemorqueId, validChauffeurId, dateDebut, dateFin)
        ).rejects.toMatchObject({ statusCode: 409 });
    });
});
