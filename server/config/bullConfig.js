const Bull = require('bull')
require('dotenv').config();
const { NODE_ENV } = process.env;

let redisURI = null
if(NODE_ENV === 'test' || NODE_ENV === 'development')
{
    redisURI = process.env.REDIS_URL_DEV
}else{
    redisURI = process.env.REDIS_URL
}


const jpProcessQueue = new Bull('jobpostingProcess', redisURI)

const loggingQueue = new Bull('loggingQueue', redisURI)

const emailServiceScheduler = new Bull('emailServiceScheduler', redisURI)

const emailSingleTaskQueue = new Bull('emailSingleTaskQueue', redisURI)

const dbDumpQueue = new Bull('dbDumpScheduler', redisURI)

const googleTKTablePurgeQueue = new Bull('googleTKTablePurge', redisURI)

module.exports = {
    jpProcessQueue, loggingQueue, emailServiceScheduler, emailSingleTaskQueue, dbDumpQueue, googleTKTablePurgeQueue
}