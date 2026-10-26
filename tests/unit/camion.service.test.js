const camionService = require('../../src/services/camion.service');
const Camion = require('../../src/models/Camion');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/Camion');

describe('CamionService - Tests Unitaires (CRUD & Soft Delete)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createCamion', () => {
        it('doit créer un camion si l’immatriculation est unique', async () => {
            Camion.findOne.mockResolvedValue(null);
            const camionData = { immatriculation: '12345-A-1', marque: 'Volvo', modele: 'FH16' };
            Camion.create.mockResolvedValue(camionData);

            const result = await camionService.createCamion(camionData);
            expect(result).toEqual(camionData);
        });

        it('doit rejeter avec 400 si l’immatriculation existe déjà', async () => {
            Camion.findOne.mockResolvedValue({ _id: 'camionExistant' });

            await expect(camionService.createCamion({ immatriculation: '12345-A-1' }))
                .rejects.toThrow(ApiError);
        });
    });

    describe('getAllCamion', () => {
        it('doit retourner les camions non archivés', async () => {
            const mockList = [{ immatriculation: '12345-A-1', statut: 'disponible' }];
            Camion.find.mockResolvedValue(mockList);

            const result = await camionService.getAllCamion();
            expect(Camion.find).toHaveBeenCalledWith({ statut: { $ne: 'archive' } });
            expect(result).toEqual(mockList);
        });
    });

    describe('getCamionById', () => {
        it('doit retourner le camion s’il existe', async () => {
            const mockCamion = { _id: 'c1', immatriculation: '12345-A-1' };
            Camion.findById.mockResolvedValue(mockCamion);

            const result = await camionService.getCamionById('c1');
            expect(result).toEqual(mockCamion);
        });

        it('doit rejeter avec 404 si le camion n’existe pas', async () => {
            Camion.findById.mockResolvedValue(null);

            await expect(camionService.getCamionById('c_inconnu'))
                .rejects.toThrow(ApiError);
        });
    });

    describe('archiverCamion', () => {
        it('doit basculer le statut en archive (Soft Delete)', async () => {
            const mockCamionArchive = {
                _id: 'camion1',
                statut: 'archive'
            };
            Camion.findByIdAndUpdate.mockResolvedValue(mockCamionArchive);

            const result = await camionService.archiverCamion('camion1');

            expect(Camion.findByIdAndUpdate).toHaveBeenCalledWith(
                'camion1',
                { statut: 'archive' },
                { new: true }
            );
            expect(result).toEqual(mockCamionArchive);
        });

        it('doit rejeter avec 404 si le camion à archiver est introuvable', async () => {
            Camion.findByIdAndUpdate.mockResolvedValue(null);

            await expect(camionService.archiverCamion('camion_inexistant'))
                .rejects.toThrow(ApiError);
        });
    });
});
