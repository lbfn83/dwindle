const Bull = require('bull')
require('dotenv').config();

const redisURI = process.env.redisURI

const jpProcessQueue = new Bull('jobpostingProcess', redisURI)

const loggingQueue = new Bull('loggingQueue', redisURI)

const emailQueue = new Bull('emailQueue', redisURI)

const dbBackupScheduler = new Bull('dbBackupScheduler', redisURI)

const dbBackupSingleTask = new Bull('dbBackupSingleTask', redisURI)

module.exports = {
    jpProcessQueue, loggingQueue, emailQueue, dbBackupScheduler, dbBackupSingleTask
}