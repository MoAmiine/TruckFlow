const { calculerDistance, calculerConsommationMoyenne } = require('../../src/services/calculation.service');
const ApiError = require('../../src/utils/apiError');

describe('CalculationService - Tests Unitaires (SRP)', () => {
    describe('calculerDistance', () => {
        it('doit calculer correctement la distance parcourue', () => {
            const distance = calculerDistance(1000, 1500);
            expect(distance).toBe(500);
        });

        it('doit rejeter si kilometrageArrivee <= kilometrageDepart avec ApiError', () => {
            expect(() => {
                calculerDistance(1500, 1000);
            }).toThrow(ApiError);

            expect(() => {
                calculerDistance(1500, 1500);
            }).toThrow(ApiError);
        });
    });

    describe('calculerConsommationMoyenne', () => {
        it('doit appliquer la formule (volume * 100) / distance avec 2 décimales', () => {
            // (120L * 100) / 400km = 30.00 L/100km
            const conso = calculerConsommationMoyenne(120, 400);
            expect(conso).toBe(30);

            // (95.5L * 100) / 280km = 34.11 L/100km
            const conso2 = calculerConsommationMoyenne(95.5, 280);
            expect(conso2).toBe(34.11);
        });

        it('doit gérer la division par zéro et les valeurs négatives sans crasher (retourne 0)', () => {
            expect(calculerConsommationMoyenne(100, 0)).toBe(0);
            expect(calculerConsommationMoyenne(0, 500)).toBe(0);
            expect(calculerConsommationMoyenne(-10, 500)).toBe(0);
            expect(calculerConsommationMoyenne(100, -50)).toBe(0);
            expect(calculerConsommationMoyenne(null, null)).toBe(0);
        });
    });
});
