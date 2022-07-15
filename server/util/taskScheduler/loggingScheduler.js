/** 
 * This is a redundant module.
 * Instead, using this module, invoking DB dump scheduler between 12:00 am and 12:30 am 
 * where the manual restart of the server starts will do the job  
*/

// to make sure invoking logger.js's rotation event without skipping it.
// The rotation event is triggered when it falls under the time period where the next log file 
// should be created and also the first log message of that time period is generated 

const {logger} = require('../../config/logger')
const {loggingQueue} = require('../../config/bullConfig')
require('dotenv').config();

const { NODE_ENV } = process.env;

const cronOpt = (() => {
    if(NODE_ENV === 'test' || NODE_ENV === 'development')
    {
        return { cron : '*/4 * * * *'};
    }
    else{
        // Pick between 12:00 and 12:30 where the manual restart of the server will start 
        return { cron : '05 12 * * *'};
    }
})();

async function registerLogging()
{
    logger.info(`[Bull loggingQueue] registered! `)

    await loggingQueue.obliterate({force : true})
    // This should be consistent with logger's rotation cycle?
    loggingQueue.add({ message : 'Winston Rotation event invoke!' } , {repeat: cronOpt})
}

loggingQueue.process( async(job) => {
    logger.info(`[Bull loggingQueue] Consumer Started!`)

    // logger.debug(`[Bull loggingQueue] job info in consumer: ${JSON.stringify(job.data)}`)
})

// logger's rotate event is more suitable for file transer to cloud
// since filename is passed. 
loggingQueue.on('completed', function (job, result) {
    // A job successfully completed with a `result`.
    logger.debug(`[Bull loggingQueue] completed  : ${JSON.stringify(job)}`)

    logger.info(`[Bull loggingQueue]  Event listner: completed : ${JSON.stringify(job.data.message)}`)
})

loggingQueue.on('error', function (error) {
    logger.error(`Error connecting to loggingQueue: "${error}"`);
})

module.exports = {registerLogging};