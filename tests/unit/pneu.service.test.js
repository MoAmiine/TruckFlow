const pneuService = require('../../src/services/Pneu.service');
const Pneu = require('../../src/models/Pneu');
const Camion = require('../../src/models/Camion');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/Pneu');
jest.mock('../../src/models/Camion');

describe('PneuService - Tests Unitaires (Association, Usure & Alertes)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createPneu', () => {
        it('doit créer un pneu si le numéro de série est unique', async () => {
            Pneu.findOne.mockResolvedValue(null);
            const mockPneu = { numeroSerie: 'SN-999', kilometrageActuel: 0 };
            Pneu.create.mockResolvedValue(mockPneu);

            const result = await pneuService.createPneu(mockPneu);
            expect(result).toEqual(mockPneu);
        });

        it('doit rejeter avec 400 si le numéro de série existe déjà', async () => {
            Pneu.findOne.mockResolvedValue({ _id: 'pneuExist' });

            await expect(pneuService.createPneu({ numeroSerie: 'SN-999' }))
                .rejects.toThrow(ApiError);
        });
    });

    describe('actualiserKilometragePneus', () => {
        it('doit incrémenter les compteurs et basculer en a_remplacer au dépassement du seuil', async () => {
            const pneuMock1 = {
                kilometrageActuel: 38000,
                seuilUsureKm: 40000,
                etat: 'bon',
                save: jest.fn().mockResolvedValue(true)
            };
            const pneuMock2 = {
                kilometrageActuel: 10000,
                seuilUsureKm: 40000,
                etat: 'neuf',
                save: jest.fn().mockResolvedValue(true)
            };

            Pneu.find.mockResolvedValue([pneuMock1, pneuMock2]);

            // Parcourt 3000 km
            await pneuService.actualiserKilometragePneus('camion1', 3000);

            // 38000 + 3000 = 41000 >= 40000 => 'a_remplacer'
            expect(pneuMock1.kilometrageActuel).toBe(41000);
            expect(pneuMock1.etat).toBe('a_remplacer');
            expect(pneuMock1.save).toHaveBeenCalled();

            // 10000 + 3000 = 13000 < 40000 => 'neuf'
            expect(pneuMock2.kilometrageActuel).toBe(13000);
            expect(pneuMock2.etat).toBe('neuf');
            expect(pneuMock2.save).toHaveBeenCalled();
        });
    });

    describe('associerPneuAuCamion', () => {
        it('doit refuser d’associer un pneu critique (a_remplacer)', async () => {
            Camion.findById.mockResolvedValue({ _id: 'camion1' });
            Pneu.findById.mockResolvedValue({ _id: 'pneu1', etat: 'a_remplacer' });

            await expect(
                pneuService.associerPneuAuCamion('pneu1', 'camion1', 'avant_gauche')
            ).rejects.toThrow(ApiError);
        });
    });
});
