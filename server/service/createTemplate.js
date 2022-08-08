const {logger} = require('../config/logger');
const MCAPI = require('../config/mailChimpAPI');
const {eamilTemplate} = require('./emailTemplate');
const {dyanmicConentBuilder} = require('./weeklyEmailDynamicContent');
const TEMPLATE_BASENAME = "Dwindle Weekly Campaign";
// const AUD_GRP_NAME = "Dwindle Student Debt";

/**
 * Reference ) 
 * https://www.epochconverter.com/weeknumbers
 */
 Date.prototype.getWeek = function () {
    var target  = new Date(this.valueOf());
    // getDay => {Monday... Sunday}
    // convert day to be counted from 0 not 1
    var dayNr   = (this.getDay() + 6) % 7;
    // get the firstThursday
    target.setDate(target.getDate() - dayNr + 3);
    var firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    // 7*24*60*60*1000
    return 1 + Math.ceil((firstThursday - target) / 604800000);
}

/** 
 * 
*/
async function createTemplateinMailChimp()
{
    try{

        let weekNumber= new Date().getWeek();
        const date = new Date();

        templateName = `${TEMPLATE_BASENAME} ${weekNumber}_${date.getDate()}_${date.getHours()}`
        logger.info(`[createTemplateinMailChimp]  This week's template name : ${templateName}`);  
        
        const generatedJPContent = await dyanmicConentBuilder();
        const aggregatedContent = eamilTemplate(await generatedJPContent);
        await MCAPI.createTemplateMrkt(templateName, eamilTemplate(await generatedJPContent)).then((response) => {
            logger.debug(`[createTemplateinMailChimp] response ${JSON.stringify(response)}`);
            return Promise.resolve(`[createTemplateinMailChimp] Template Created!`);
        });
    }catch(err)
    {
        return Promise.reject(`[createTemplateinMailChimp] Err : ${err}`);
    }
}



module.exports = {  createTemplateinMailChimp  };