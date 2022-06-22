const logger = require('../../config/logger')
const {loggingQueue} = require('../../config/bullConfig')

// Obsolete : don't need it
// every hour it just generates notification log
// Not sure if this is really needed. My initial thought was
// to make sure invoking logger.js's rotation event without skipping it.
function registerLogging()
{
    logger.info(`[Bull loggingQueue] registered! `)
    // sometime, multiple jobs of same kind are registered
    // seems like redis is contaminated and use obliterate to reset redis
    
    // loggingQueue.obliterate({force : true})

    // This should be consistent with logger's rotation cycle?
    loggingQueue.add({ message : 'logging finished' } , {repeat:
        {
            // cron : '*/1 * * * *'
            cron : '58 * * * *'
        }
    })
}

loggingQueue.process( async(job) => {
    logger.info(`[Bull loggingQueue] Consumer Started!`)

    logger.debug(`[Bull loggingQueue] job info in consumer: ${JSON.stringify(job.data)}`)
})

// logger's rotate event is more suitable for file transer to cloud
// since filename is passed. 
loggingQueue.on('completed', function (job, result) {
    // A job successfully completed with a `result`.
    logger.debug(`[Bull loggingQueue] completed  : ${JSON.stringify(job)}`)
    
    logger.info(`[Bull loggingQueue] completed : ${JSON.stringify(result)}`)
    logger.info(`[Bull loggingQueue] completed : ${JSON.stringify(job.data)}`)
})

module.exports = {registerLogging};