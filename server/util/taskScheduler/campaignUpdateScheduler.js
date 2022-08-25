//Disabled as the workflow of email campaign has been changed to 
//update the template with dynamic content 

const {logger} =  require('../../config/logger')
const {emailCampaignUpdateQueue} = require('../../config/bullConfig')
const { weeklyCampaignUpdate} = require('../../service/weeklyEmailCampaignCreateAndUpdate')
require('dotenv').config();

const { NODE_ENV } = process.env;

const cronOpt = (() => {
    if(NODE_ENV === 'test' || NODE_ENV === 'development')
    {
        return { cron : '*/5 * * * *'};
    }
    else{
        // At 03:30 a.m on Monday.
        return { cron : '30 03 * * 1'};
    }
})();


async function registerCampaignUpdateService()
{
    logger.info(`[Bull registerCampaignUpdateService] registered! `);
    await emailCampaignUpdateQueue.obliterate({force : true});

    // “At 10:00 on Saturday and Sunday.”
    emailCampaignUpdateQueue.add({ message : 'registerCampaignUpdateService processing' } , {repeat: cronOpt });
}



emailCampaignUpdateQueue.process(async(job) => {
    
    logger.info(`[Bull registerCampaignUpdateService] Consumer: job info : ${JSON.stringify(job.data.message)}`);
    await weeklyCampaignUpdate().then((msg) =>
    {
        logger.info(`[Bull registerCampaignUpdateService] Consumer done processing! : ${msg}`);
    }).catch((error) => {
        logger.error(`[Bull registerCampaignUpdateService] Consumer error : ${error}`);
    }); 
   

});


module.exports = {registerCampaignUpdateService};