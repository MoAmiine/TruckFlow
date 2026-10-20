const { PutObjectCommand, CreateBucketCommand, HeadBucketCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { s3Client } = require('../config/s3');
const ApiError = require('../utils/apiError');
const bucketName = process.env.S3_BUCKET || 'truckflow-documents';

async function uploadMissionOrder(pdfBuffer, trajetId) {
    const annee = new Date().getFullYear();
    const s3Key = `orders/${annee}/TRP-${annee}-${trajetId}.pdf`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        Metadata: {
            trajetId: trajetId.toString(),
            type: 'ordre de mission'
        }
    })
    await s3Client.send(command);

    return {
        bucket: bucketName, s3Key,
        sizeBytes: pdfBuffer.length
    };
}

async function generatePresignedUrl(s3Key, expiresIn = 900) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key
    })

    return await getSignedUrl(s3Client, command, { expiresIn });
}


module.exports = {
    uploadMissionOrder,
    generatePresignedUrl,
}

