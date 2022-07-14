const Bull = require('bull')
// https://stackoverflow.com/questions/67528225/how-to-make-a-redis-bull-queue-in-a-node-js-environment-thats-deployed-to-her
// const redis = require('redis')
const url = require('url')
require('dotenv').config();
const { NODE_ENV } = process.env;

// redis.createClient({)
let redisURI = null
if(NODE_ENV === 'test' || NODE_ENV === 'development')
{
    redisURI = process.env.REDIS_URL_DEV
}else{
    // old code : redisURI = process.env.REDIS_URL
    
    // https://devcenter.heroku.com/articles/securing-heroku-redis
    const parsedURI = url.parse(process.env.REDIS_URL);
    redisURI = {
        // The server-side Stunnel process runs one port higher than your Heroku Redis instance port.
        //  For example, if your Redis service runs on port 6379, Stunnel listens to port 6380.
        port: Number(parsedURI.port) + 1,

        host: parsedURI.hostname,
      
        password: parsedURI.auth.split(':')[1],
      
        db: 0,

        tls: {
      
          rejectUnauthorized: false,
      
          requestCert: true,
      
          agent: false
      
        }

    }
}

// third argument is for options

const jpProcessQueue = new Bull('jobpostingProcess', redisURI)

const loggingQueue = new Bull('loggingQueue', redisURI)

const emailCampaignCreateQueue = new Bull('emailCampaignCreateQueue', redisURI)

const emailCampaignSendQueue = new Bull('emailCampaignSendQueue', redisURI)

const dbDumpQueue = new Bull('dbDumpScheduler', redisURI)

const googleTKTablePurgeQueue = new Bull('googleTKTablePurge', redisURI)

module.exports = {
    jpProcessQueue, loggingQueue, emailCampaignCreateQueue, emailCampaignSendQueue, dbDumpQueue, googleTKTablePurgeQueue
}