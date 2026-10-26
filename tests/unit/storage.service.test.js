const storageService = require('../../src/services/storage.service');
const { s3Client } = require('../../src/config/s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

jest.mock('../../src/config/s3', () => ({
    s3Client: {
        send: jest.fn()
    }
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn()
}));

describe('StorageService - Tests Unitaires (Mocking S3 Client & Presigned URLs)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadMissionOrder', () => {
        it('doit téléverser un binaire PDF et renvoyer le bucket, la clé S3 et la taille en octets', async () => {
            s3Client.send.mockResolvedValue({});

            const mockBuffer = Buffer.from('PDF_TEST_DATA');
            const mockTrajetId = '670cfa3b1234567890abcdef';

            const result = await storageService.uploadMissionOrder(mockBuffer, mockTrajetId);

            expect(s3Client.send).toHaveBeenCalledTimes(1);
            expect(result).toHaveProperty('bucket');
            expect(result).toHaveProperty('s3Key');
            expect(result.sizeBytes).toBe(mockBuffer.length);
            expect(result.s3Key).toMatch(new RegExp(`orders/\\d{4}/TRP-\\d{4}-${mockTrajetId}\\.pdf`));
        });
    });

    describe('generatePresignedUrl', () => {
        it('doit générer une Presigned URL cryptographique avec expiration TTL de 15 min (900s)', async () => {
            const expectedUrl = 'https://minio.truckflow.local/truckflow-documents/orders/2026/TRP.pdf?X-Amz-Signature=xyz';
            getSignedUrl.mockResolvedValue(expectedUrl);

            const s3Key = 'orders/2026/TRP-2026-0001.pdf';
            const url = await storageService.generatePresignedUrl(s3Key, 900);

            expect(getSignedUrl).toHaveBeenCalledWith(
                s3Client,
                expect.any(Object),
                { expiresIn: 900 }
            );
            expect(url).toBe(expectedUrl);
        });
    });
});
