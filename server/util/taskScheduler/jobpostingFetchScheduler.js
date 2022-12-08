
const {logger} = require('../../config/logger')

const {pullJobPostings} = require('../../service/jobPostingFetcher')
const {jobPostingDataPurge} = require('../../service/jobPostingDataPurge')

const {jpProcessQueue} = require('../../config/bullConfig')
require('dotenv').config();

// TODO : for now I am thinking breaking down each query in producer
// is not going to improve as RapidAPI server itself is very high latency 
// and will return error in case of repeated incoming queries at short interval

const { NODE_ENV } = process.env;
logger.info(`[Bull jpProcessQueue] NODE_ENV ${NODE_ENV} `)
const cronOpt = (() => {
    if(NODE_ENV === 'test' || NODE_ENV === 'development')
    {
        // At 00:00 on Monday in September.”
        return { cron : '0 0 * 9 1'};
        // return { cron : '06 14 * * *'};
    }
    else{
        // At 10:00 UTC on Monday, Tuesday, Wednesday, Thursday, and Friday.
        return { cron : '30 04 * * 1,2,3,4,5'};
    }
})();


// producer : it should be defined in worker.js process later in production
// for now below code should be placed in server.js for testing
async function registerJPProcess()
{
    
    logger.info(`[Bull jpProcessQueue] registered! `);
    await jpProcessQueue.obliterate({force : true});
    jpProcessQueue.add({ jobprocess : 'start' } , {repeat: cronOpt});
}

// consumer
jpProcessQueue.process( async(job) => {
    logger.info(`[Bull jpProcessQueue] : ${JSON.stringify(job)}`);
    
    await pullJobPostings().then( async()=>{
        await jobPostingDataPurge();
    })
    .then((data)=> {
        logger.info(`[Bull jpProcessQueue] Done! : ${data}`);
        
    });

})

// TODO: JOBPOSTING  process functions is not well fit for bull function 
// as I have to break down each query one by one and feed into producer
jpProcessQueue.on('completed', function (job, result) {
    // A job successfully completed with a `result`.
    logger.info(`[Bull jpProcessQueue] complete event : ${JSON.stringify(job)}, ${result}`);
})

jpProcessQueue.on('error', function (error) {
    logger.error(`Error connecting to jpProcessQueue: "${error}"`);
})

module.exports = {registerJPProcess};