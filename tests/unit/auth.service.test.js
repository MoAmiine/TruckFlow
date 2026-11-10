const authService = require('../../src/services/auth.service');
const User = require('../../src/models/User');
const tokenUtil = require('../../src/utils/token.util');
const ApiError = require('../../src/utils/apiError');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/User');
jest.mock('../../src/utils/token.util');
jest.mock('jsonwebtoken');

describe('AuthService - Tests Unitaires (Register, Login, Tokens, Me, Refresh, Logout)', () => {
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
                role: 'chauffeur',
                statut: 'actif'
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
        it('doit authentifier et générer accessToken et refreshToken avec identité', async () => {
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
            expect(result).toHaveProperty('role', 'chauffeur');
            expect(result).toHaveProperty('id', 'user1');
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

    describe('getMe', () => {
        it('doit retourner le profil utilisateur sans mot de passe', async () => {
            const mockUser = {
                _id: 'user1',
                nom: 'Super',
                prenom: 'Admin',
                email: 'admin@truckflow.com',
                role: 'admin',
                statut: 'actif'
            };
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const result = await authService.getMe('user1');
            expect(result).toEqual(mockUser);
        });

        it('doit rejeter avec 404 si l’utilisateur n’est pas trouvé', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(authService.getMe('inconnu')).rejects.toThrow(ApiError);
        });
    });

    describe('refreshToken', () => {
        it('doit renouveler l’accessToken avec un refreshToken valide', async () => {
            jwt.verify.mockReturnValue({ id: 'user1' });
            const mockUser = {
                _id: 'user1',
                refreshToken: 'valid_refresh_token',
                statut: 'actif'
            };
            User.findById.mockResolvedValue(mockUser);
            tokenUtil.generateAccessToken.mockReturnValue('new_access_token');

            const result = await authService.refreshToken('valid_refresh_token');
            expect(result).toHaveProperty('accessToken', 'new_access_token');
        });

        it('doit rejeter avec 400 si aucun token n’est fourni', async () => {
            await expect(authService.refreshToken(null)).rejects.toThrow(ApiError);
        });

        it('doit rejeter avec 401 si le refreshToken est révoqué ou ne correspond pas', async () => {
            jwt.verify.mockReturnValue({ id: 'user1' });
            const mockUser = {
                _id: 'user1',
                refreshToken: 'another_token',
                statut: 'actif'
            };
            User.findById.mockResolvedValue(mockUser);

            await expect(authService.refreshToken('invalid_token')).rejects.toThrow(ApiError);
        });
    });

    describe('logout', () => {
        it('doit révoquer le refreshToken en base de données', async () => {
            User.findByIdAndUpdate.mockResolvedValue(true);
            const result = await authService.logout('user1');
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user1', { refreshToken: null });
            expect(result).toBe(true);
        });
    });
});
