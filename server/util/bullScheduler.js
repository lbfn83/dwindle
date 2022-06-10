const Bull = require('bull')
const logger = require('./logger')
const {pullJobPostings} = require('../controllers/jobPostingFetcher')
const {jobPostingDataPurge} = require('../controllers/jobPostingDataPurge')
const redisURI = 'redis://127.0.0.1'

const jpProcessQueue = new Bull('jobpostingProcess', redisURI)
// producer : it hsould be defined in worker.js process later in production
// for now below code should be placed in server.js for testing

// jpProcessQueue.add({ jobprocess : 'start' } , {repeat:
//     {
//         cron : '0 13 * * *'
//     }
// })

// consumer
jpProcessQueue.process( async(job) => {
    logger.info(`[Bull jpProcessQueue] : ${JSON.stringify(job)}`)
    
    pullJobPostings().then( async()=>{
        await jobPostingDataPurge()
    })
    .then((data)=> {
        logger.info(`[Bull jpProcessQueue] Done! : ${data}`)
        
    })

})

// TODO: JOBPOSTING  process functions is not well fit for bull function 
// as I have to break down each query one by one and feed into producer
jpProcessQueue.on('completed', function (job, result) {
    // A job successfully completed with a `result`.
    logger.info(`[Bull jpProcessQueue] completion event : ${JSON.stringify(job)}, ${result}`)
})

module.exports = jpProcessQueue;