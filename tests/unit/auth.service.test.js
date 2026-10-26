const authService = require('../../src/services/auth.service');
const User = require('../../src/models/User');
const tokenUtil = require('../../src/utils/token.util');
const ApiError = require('../../src/utils/apiError');

jest.mock('../../src/models/User');
jest.mock('../../src/utils/token.util');

describe('AuthService - Tests Unitaires (Register, Login, Tokens)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('doit créer un nouvel utilisateur avec succès', async () => {
            User.findOne.mockResolvedValue(null);
            const mockUser = {
                _id: 'user1',
                nom: 'Alami',
                prenom: 'Karim',
                email: 'karim@test.com',
                role: 'chauffeur'
            };
            User.create.mockResolvedValue(mockUser);

            const result = await authService.register({
                nom: 'Alami',
                prenom: 'Karim',
                email: 'karim@test.com',
                motDePasse: 'plainPassword123',
                role: 'chauffeur'
            });

            expect(User.findOne).toHaveBeenCalledWith({ email: 'karim@test.com' });
            expect(User.create).toHaveBeenCalled();
            expect(result).toHaveProperty('email', 'karim@test.com');
        });

        it('doit rejeter avec 400 si l’email est déjà utilisé', async () => {
            User.findOne.mockResolvedValue({ _id: 'userExistant' });

            await expect(
                authService.register({ email: 'karim@test.com' })
            ).rejects.toThrow(ApiError);
        });
    });

    describe('login', () => {
        it('doit authentifier et générer accessToken et refreshToken', async () => {
            const mockUser = {
                _id: 'user1',
                nom: 'Alami',
                prenom: 'Karim',
                email: 'karim@test.com',
                role: 'chauffeur',
                statut: 'actif',
                comparerMotDePasse: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);
            tokenUtil.generateAccessToken.mockReturnValue('access_token_jwt');
            tokenUtil.generateRefreshToken.mockReturnValue('refresh_token_jwt');

            const result = await authService.login('karim@test.com', 'plainPassword');

            expect(mockUser.comparerMotDePasse).toHaveBeenCalledWith('plainPassword');
            expect(result).toHaveProperty('accessToken', 'access_token_jwt');
            expect(result).toHaveProperty('refreshToken', 'refresh_token_jwt');
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('doit rejeter avec 401 si l’utilisateur n’existe pas', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(
                authService.login('inconnu@test.com', 'plainPassword')
            ).rejects.toThrow(ApiError);
        });

        it('doit rejeter avec 401 si le mot de passe est erroné', async () => {
            const mockUser = {
                _id: 'user1',
                email: 'karim@test.com',
                comparerMotDePasse: jest.fn().mockResolvedValue(false)
            };
            User.findOne.mockResolvedValue(mockUser);

            await expect(
                authService.login('karim@test.com', 'wrongPassword')
            ).rejects.toThrow(ApiError);
        });

        it('doit rejeter avec 403 si l’utilisateur est suspendu', async () => {
            const mockUser = {
                _id: 'user1',
                email: 'karim@test.com',
                statut: 'suspendu',
                comparerMotDePasse: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);

            await expect(
                authService.login('karim@test.com', 'password')
            ).rejects.toThrow(ApiError);
        });
    });
});
