const userService = require('../../src/services/user.service');
const User = require('../../src/models/User');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/User');

describe('UserService - Tests Unitaires (Chauffeurs & Suspension)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createChauffeur', () => {
        it('doit créer un nouveau chauffeur avec succès', async () => {
            User.findOne.mockResolvedValue(null);
            const chauffeurData = {
                nom: 'Benani',
                prenom: 'Omar',
                email: 'omar@truckflow.com',
                motDePasse: 'pass123'
            };
            User.create.mockResolvedValue({ ...chauffeurData, role: 'chauffeur' });

            const result = await userService.createChauffeur(chauffeurData);
            expect(User.findOne).toHaveBeenCalledWith({ email: chauffeurData.email });
            expect(result).toHaveProperty('role', 'chauffeur');
        });

        it('doit rejeter avec 400 si l’email du chauffeur est déjà utilisé', async () => {
            User.findOne.mockResolvedValue({ _id: 'chauffeurExist' });

            await expect(userService.createChauffeur({ email: 'existant@truckflow.com' }))
                .rejects.toThrow(ApiError);
        });
    });

    describe('getAllChauffeurs', () => {
        it('doit lister tous les chauffeurs sans exposer les mots de passe', async () => {
            const mockChauffeurs = [
                { _id: 'u1', nom: 'Amine', role: 'chauffeur', statut: 'actif' }
            ];
            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockChauffeurs)
            });

            const result = await userService.getAllChauffeurs();
            expect(User.find).toHaveBeenCalledWith({ role: 'chauffeur' });
            expect(result).toEqual(mockChauffeurs);
        });
    });

    describe('changerStatutChauffeur', () => {
        it('doit changer le statut d’un chauffeur (ex: suspendu)', async () => {
            const updatedChauffeur = {
                _id: 'u1',
                statut: 'suspendu'
            };
            User.findByIdAndUpdate.mockResolvedValue(updatedChauffeur);

            const result = await userService.changerStatutChauffeur('u1', 'suspendu');
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u1', { statut: 'suspendu' }, { new: true });
            expect(result).toEqual(updatedChauffeur);
        });
    });
});
