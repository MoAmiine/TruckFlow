const { PutObjectCommand, CreateBucketCommand, HeadBucketCommand  } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');

const bucketName = process.env.S3_BUCKET || 'TruckFlow documents';

async function uploadMissionOrder(pdfBuffer, trajetId){
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

module.exports = {
    uploadMissionOrder, 
}

