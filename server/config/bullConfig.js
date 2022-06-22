const Bull = require('bull')
require('dotenv').config();

const redisURI = process.env.REDIS_URL

const jpProcessQueue = new Bull('jobpostingProcess', redisURI)

const loggingQueue = new Bull('loggingQueue', redisURI)

const emailServiceScheduler = new Bull('emailServiceScheduler', redisURI)

const emailSingleTaskQueue = new Bull('emailSingleTaskQueue', redisURI)

const dbDumpScheduler = new Bull('dbDumpScheduler', redisURI)

module.exports = {
    jpProcessQueue, loggingQueue, emailServiceScheduler, emailSingleTaskQueue, dbDumpScheduler
}