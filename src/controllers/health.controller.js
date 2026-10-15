const mongoose = require('mongoose');
const redisClient = require('../config/redis');
const { s3Client, ListBucketsCommand } = require('../config/s3');

// GET /healthz/liveness
async function checkLiveness(req, res) {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
}

// GET /healthz/readiness
async function checkReadiness(req, res) {
  const checks = {
    mongodb: 'DOWN',
    redis: 'DOWN',
    minio: 'DOWN'
  };

  // 1. Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      checks.mongodb = 'UP';
    }
  } catch (err) {
    checks.mongodb = `DOWN (${err.message})`;
  }

  // 2. Check Redis
  try {
    if (redisClient.status === 'ready' || redisClient.status === 'connect') {
      const pong = await redisClient.ping();
      if (pong === 'PONG') checks.redis = 'UP';
    } else {
      await redisClient.connect();
      const pong = await redisClient.ping();
      if (pong === 'PONG') checks.redis = 'UP';
    }
  } catch (err) {
    checks.redis = `DOWN (${err.message})`;
  }

  // 3. Check MinIO / S3
  try {
    await s3Client.send(new ListBucketsCommand({}));
    checks.minio = 'UP';
  } catch (err) {
    checks.minio = `DOWN (${err.message})`;
  }

  const isHealthy =
    checks.mongodb === 'UP' &&
    checks.redis === 'UP' &&
    checks.minio === 'UP';

  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    services: checks
  });
}

module.exports = {
  checkLiveness,
  checkReadiness
};
