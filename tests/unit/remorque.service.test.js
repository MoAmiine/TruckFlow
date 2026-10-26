const remorqueService = require('../../src/services/remorque.service');
const Remorque = require('../../src/models/Remorque');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/Remorque');

describe('RemorqueService - Tests Unitaires (CRUD & Soft Delete)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRemorque', () => {
        it('doit créer une remorque avec succès si l’immatriculation est unique', async () => {
            Remorque.findOne.mockResolvedValue(null);
            const data = { immatriculation: 'R-1122-33', type: 'citerne', capaciteCharge: 25000 };
            Remorque.create.mockResolvedValue(data);

            const result = await remorqueService.createRemorque(data);
            expect(result).toEqual(data);
        });

        it('doit rejeter avec 400 si l’immatriculation existe déjà', async () => {
            Remorque.findOne.mockResolvedValue({ _id: 'remorqueExist' });

            await expect(remorqueService.createRemorque({ immatriculation: 'R-1122-33' }))
                .rejects.toThrow(ApiError);
        });
    });

    describe('getAllRemorques', () => {
        it('doit lister toutes les remorques non archivées', async () => {
            const mockList = [{ immatriculation: 'R-1', statut: 'disponible' }];
            Remorque.find.mockResolvedValue(mockList);

            const result = await remorqueService.getAllRemorques();
            expect(Remorque.find).toHaveBeenCalledWith({ statut: { $ne: 'archive' } });
            expect(result).toEqual(mockList);
        });
    });

    describe('getRemorqueById', () => {
        it('doit retourner la remorque si elle existe', async () => {
            const mockRem = { _id: 'rem1', immatriculation: 'R-1' };
            Remorque.findById.mockResolvedValue(mockRem);

            const result = await remorqueService.getRemorqueById('rem1');
            expect(result).toEqual(mockRem);
        });

        it('doit rejeter avec 404 si la remorque n’existe pas', async () => {
            Remorque.findById.mockResolvedValue(null);

            await expect(remorqueService.getRemorqueById('rem_inconnu'))
                .rejects.toThrow(ApiError);
        });
    });

    describe('archiverRemorque', () => {
        it('doit archiver la remorque disponible', async () => {
            const mockRemorque = {
                _id: 'rem1',
                statut: 'archive'
            };
            Remorque.findByIdAndUpdate.mockResolvedValue(mockRemorque);

            const result = await remorqueService.archiverRemorque('rem1');
            expect(Remorque.findByIdAndUpdate).toHaveBeenCalledWith('rem1', { statut: 'archive' }, { new: true });
            expect(result).toEqual(mockRemorque);
        });

        it('doit rejeter avec 404 si la remorque est introuvable', async () => {
            Remorque.findByIdAndUpdate.mockResolvedValue(null);

            await expect(remorqueService.archiverRemorque('rem_inconnue'))
                .rejects.toThrow(ApiError);
        });
    });
});
