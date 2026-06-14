const { createClient } = require('redis');
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
const dotenvResult = require('dotenv').config({ path: envPath });


const redisClient = createClient({
    url: process.env.REDIS_URL
});

module.exports = redisClient;