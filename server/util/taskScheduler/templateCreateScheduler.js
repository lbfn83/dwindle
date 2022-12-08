//Disabled as the workflow of email campaign has been changed to 
//update the template with dynamic content 

const {logger} =  require('../../config/logger')
const {emailTemplateCreateQueue} = require('../../config/bullConfig')

const { createTemplateinMailChimp} = require('../../service/createDynamicContentOnTemplate')
require('dotenv').config();

const { NODE_ENV } = process.env;

const cronOpt = (() => {
    if(NODE_ENV === 'test' || NODE_ENV === 'development')
    {
        // At 00:00 on Monday in September.”
        return { cron : '0 0 * 9 1'};

    }
    else{
        // At 03:00 a.m on Tuesday.
        return { cron : '00 02 * * 2'};
    }
})();


async function registerTemplateCreateService()
{
    logger.info(`[Bull TemplateCreateService] registered! `);
    await emailTemplateCreateQueue.obliterate({force : true});

    // “At 10:00 on Saturday and Sunday.”
    emailTemplateCreateQueue.add({ message : 'TemplateCreateService processing' } , {repeat: cronOpt });
}


emailTemplateCreateQueue.process(async(job) => {
    
    logger.info(`[Bull TemplateCreateService] Consumer: job info : ${JSON.stringify(job.data.message)}`);
    await createTemplateinMailChimp().then((msg) =>
    {
        logger.info(`[Bull TemplateCreateService] Consumer done processing! : ${msg}`);
    }).catch((error) => {
        logger.error(`[Bull TemplateCreateService] Consumer error : ${error}`);
    }); 
   

});


module.exports = {registerTemplateCreateService}