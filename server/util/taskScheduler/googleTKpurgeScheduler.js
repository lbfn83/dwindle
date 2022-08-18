
const {logger} = require('../../config/logger')

const {googleTokenTablePurge} = require('../../service/googleTokenTablePurge')

const {googleTKTablePurgeQueue} = require('../../config/bullConfig')

require('dotenv').config();
const { NODE_ENV } = process.env;

logger.info(`[Bull googleTKpurgeScheduler] NODE_ENV ${NODE_ENV} `)

const cronOpt = (() => {
    if(NODE_ENV === 'development')
    {
        return { cron : '*/2 * * * *'};
    }
    else{
        return { cron : '15 1 * * 2'};
    }
})();


async function registerGoogleTKpurgeScheduler()
{
    logger.info(`[Bull googleTKpurgeScheduler] registered! `);
    await googleTKTablePurgeQueue.obliterate({force : true});
    googleTKTablePurgeQueue.add({ message : 'google token table purge finished!' } , {repeat: cronOpt});
}

googleTKTablePurgeQueue.process( async(job) => {
    logger.info(`[Bull googleTKpurgeScheduler] Consumer Started!`);

    // logger.info(`[Bull DBDumpScheduler] Consumer: job info in consumer: ${JSON.stringify(job.data)}`)
    googleTokenTablePurge();
})
googleTKTablePurgeQueue.on('completed', function (job) {
    // A job successfully completed with a `result`.
    logger.debug(`[Bull googleTKpurgeScheduler] Event listner : completed  : ${JSON.stringify(job)}`);
    
    logger.info(`[Bull googleTKpurgeScheduler] Event listner: completed : ${JSON.stringify(job.data.message)}`);
})

googleTKTablePurgeQueue.on('error', function (error) {
    logger.error(`Error connecting to googleTKTablePurgeQueue: "${error}"`);
})

module.exports = {registerGoogleTKpurgeScheduler};