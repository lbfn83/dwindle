const {logger} = require('../config/logger');
const MCAPI = require('../config/mailChimpAPI');
const {eamilTemplate} = require('./emailTemplate');
const {dyanmicConentBuilder} = require('./weeklyEmailDynamicContent');
const TEMPLATE_BASENAME = "Dwindle Weekly Campaign";
const BENEFIT_TYPES = require('../static/benefit_type');
const { MAIL_CHIMP_BENEFIT_TYPE } = process.env;
// When this variable sets true, it will create 5 different types of email templates 
// with different criteria 
// e.x.) job postings from the companies that posted most job ads in this week without considering benefit type 
// or those from the companies offering each of specified benfit types among ['student_loan_repayment', 'tuition_assistance', 'tuition_reimbursement', 'full_tuition_coverage']
// that have most jobpostings this week
// const CREATE_ALL_TEMPLATE_TYPES = true;
const { CREATE_ALL_TEMPLATE_TYPES } = process.env;
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
        
        if( CREATE_ALL_TEMPLATE_TYPES === true)
        {
            logger.info(`[createTemplateinMailChimp]  CREATE_ALL_TEMPLATE_TYPES ? : ${CREATE_ALL_TEMPLATE_TYPES}`);  
            let Benefit_Types_array = [];
            Benefit_Types_array.push(...BENEFIT_TYPES);
            Benefit_Types_array.push('');


            logger.debug(`[createTemplateinMailChimp]  benefit types array  : ${JSON.stringify(Benefit_Types_array)}`);  
            // https://www.techiediaries.com/promise-all-map-async-await-example/
            Promise.all(Benefit_Types_array.map(async(benefit)=>{
                const templateName = `${TEMPLATE_BASENAME} ${weekNumber} ${(benefit === '')?'most_active':benefit}`
                logger.info(`[createTemplateinMailChimp]  This week's template name : ${templateName}`);  
            
                const generatedJPContent = await dyanmicConentBuilder(benefit);
    
                const aggregatedContent = eamilTemplate(await generatedJPContent);
                logger.debug(`[createTemplateinMailChimp] created template content :
                 ${JSON.stringify(aggregatedContent)}`);
                await MCAPI.createTemplateMrkt(templateName, aggregatedContent).then((response) => {
                    logger.debug(`[createTemplateinMailChimp] response ${JSON.stringify(response)}`);
                    return Promise.resolve(`[createTemplateinMailChimp] Template Created!`);
                });
            }));

        }else{
            logger.info(`[createTemplateinMailChimp]  CREATE_ALL_TEMPLATE_TYPES ? : ${CREATE_ALL_TEMPLATE_TYPES}`);  
            let benefit_type = MAIL_CHIMP_BENEFIT_TYPE;    
            // if(benefit_type === undefined || benefit_type === null)
            // {
            //     benefit_type = 'most_active'
            // }
            
            // templates.create function : String arg has a size limit which is not really well specified in the API doc. 
            // Poor documentation. can't add date information 
            const templateName = `${TEMPLATE_BASENAME} ${weekNumber} ${(benefit_type === undefined || benefit_type === null)?'most_active':benefit_type}`//_${date.getDate()}_${date.getHours()}
            logger.info(`[createTemplateinMailChimp]  This week's template name : ${templateName}`);  
            
            
            const generatedJPContent = await dyanmicConentBuilder(benefit_type);

            const aggregatedContent = eamilTemplate(await generatedJPContent);
            logger.debug(`[createTemplateinMailChimp] created template content :
             ${JSON.stringify(aggregatedContent)}`);

            await MCAPI.createTemplateMrkt(templateName, aggregatedContent).then((response) => {
                logger.debug(`[createTemplateinMailChimp] response ${JSON.stringify(response)}`);
                return Promise.resolve(`[createTemplateinMailChimp] Template Created!`);
            });
        }
    }catch(err)
    {
        logger.error(`[createTemplateinMailChimp] Err :  ${err}`);
        return Promise.reject(`[createTemplateinMailChimp] Err : ${err}`);
    }
}



module.exports = {  createTemplateinMailChimp  };