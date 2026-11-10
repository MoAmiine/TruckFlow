const userService = require('../../src/services/user.service');
const User = require('../../src/models/User');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/User');

describe('UserService - Tests Unitaires (Chauffeurs, Utilisateurs & Suspension)', () => {
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

    describe('getAllUsers', () => {
        it('doit lister tous les utilisateurs (admins et chauffeurs)', async () => {
            const mockUsers = [
                { _id: 'u1', nom: 'Admin', role: 'admin' },
                { _id: 'u2', nom: 'Karim', role: 'chauffeur' }
            ];
            User.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockUsers)
                })
            });

            const result = await userService.getAllUsers();
            expect(User.find).toHaveBeenCalled();
            expect(result).toEqual(mockUsers);
        });
    });

    describe('getUserById', () => {
        it('doit retourner l’utilisateur si trouvé', async () => {
            const mockUser = { _id: 'u1', nom: 'Karim', role: 'chauffeur' };
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const result = await userService.getUserById('u1');
            expect(result).toEqual(mockUser);
        });

        it('doit rejeter avec 404 si l’utilisateur est introuvable', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(userService.getUserById('inexistant')).rejects.toThrow(ApiError);
        });
    });

    describe('updateUser', () => {
        it('doit mettre à jour les données de l’utilisateur', async () => {
            const updatedUser = { _id: 'u1', nom: 'Karim Modifié' };
            User.findByIdAndUpdate.mockReturnValue({
                select: jest.fn().mockResolvedValue(updatedUser)
            });

            const result = await userService.updateUser('u1', { nom: 'Karim Modifié' });
            expect(result).toEqual(updatedUser);
        });

        it('doit rejeter avec 404 si l’utilisateur à modifier n’existe pas', async () => {
            User.findByIdAndUpdate.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(userService.updateUser('inexistant', { nom: 'Test' })).rejects.toThrow(ApiError);
        });
    });

    describe('changerStatutChauffeur', () => {
        it('doit changer le statut d’un utilisateur en suspendu', async () => {
            const updatedChauffeur = {
                _id: 'u1',
                statut: 'suspendu'
            };
            User.findByIdAndUpdate.mockReturnValue({
                select: jest.fn().mockResolvedValue(updatedChauffeur)
            });

            const result = await userService.changerStatutChauffeur('u1', 'suspendu');
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u1', { statut: 'suspendu' }, { new: true });
            expect(result).toEqual(updatedChauffeur);
        });

        it('doit rejeter avec 400 si le statut est invalide', async () => {
            await expect(userService.changerStatutChauffeur('u1', 'invalide_status'))
                .rejects.toThrow(ApiError);
        });
    });
});
