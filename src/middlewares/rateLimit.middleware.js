const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');
const { default: slowDown } = require('express-slow-down');


function createRedisStore(prefix) {
  return new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: prefix
  });
}

const globalApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:std:'),
    message: {
        status: 'error',
        statusCode: 429,
        message: 'Too many requests, try again later'
    }
});

const authApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:auth:'),
    message: {
        status: 'error',
        statusCode: 429,
        message: 'Too many requests try again later'
    }
})

const analyticsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:analytics:'),
    message: { 
        status: 'error',
        statusCode: 429,
        message: 'Too many requests'
    }
})

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: (used, req) => (used - req.slowDown.limit) * 150,
    maxDelayMs: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('slowdown')
})

module.exports = {
    globalApiLimiter,
    authApiLimiter,
    analyticsLimiter,
    speedLimiter
}; 