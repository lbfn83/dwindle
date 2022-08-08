//Disabled as the workflow of email campaign has been changed to 
//update the template with dynamic content 

const {logger} =  require('../../config/logger')
const {emailCampaignSendQueue} = require('../../config/bullConfig')
const {weeklyCampaignSend} = require('../../service/weeklyEmailCampaignSend')


require('dotenv').config();

const { NODE_ENV } = process.env;

const cronOpt = (() => {
    if(NODE_ENV === 'test' || NODE_ENV === 'development')
    {
        return { cron : '57 * * * *'};
    }
    else{
        // At 3:00 a.m. on Wednesday.
        return { cron : '00 03 * * 3'};
    }
})();


async function registerCampaignSendService()
{
    logger.info(`[Bull emailCampaignSendQueue] registered!`);
    await emailCampaignSendQueue.obliterate({force : true});

    // “At 10:00 on Saturday and Sunday.”
    emailCampaignSendQueue.add({ message : 'emailCampaignSendQueue processing' } , {repeat: cronOpt });
}


emailCampaignSendQueue.process(async(job) => {
    
    logger.info(`[Bull emailCampaignSendQueue] Consumer: job info : ${JSON.stringify(job.data.message)}`)
    
    await weeklyCampaignSend().then((msg) =>
    {
        logger.info(`[Bull emailCampaignSendQueue] Consumer done processing! : ${msg}`);
    }).catch((error) => {
        logger.error(`[Bull emailCampaignSendQueue] Consumer error : ${error}`);
    }); 
    

})



emailCampaignSendQueue.on('completed', function (job, result) {
    // A job successfully completed with a `result`.
    logger.info(`[Bull emailCampaignSendQueue] complete event : ${JSON.stringify(job)}, ${result}`)
})

emailCampaignSendQueue.on('error', function (error) {
    logger.error(`Error connecting to emailCampaignSendQueue: "${error}"`);
})
emailCampaignSendQueue.on('active', function (job, jobPromise) {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
    logger.info(`[Bull emailCampaignSendQueue] active : ${JSON.stringify(job)}`)
})

module.exports = {registerCampaignSendService}