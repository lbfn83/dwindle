const {logger} = require('../config/logger');
const MCAPI = require('../config/mailChimpAPI');
const {updateListIDandTemplateID} = require('./weeklyEmailCampaignCreateAndUpdate');

var listID = undefined;

/**
 * This function is a wrapper for MailChimp setAudienceMember API. 
 * Firstly, it fetches the Audience ID, corresponding to AUD_GRP_NAME variable in weeklyEmailCampaignCreateAndUpdate,
 * which is a required arg to call setAudienceMember()
 * and then invoke setAudienceMember() func.
 * 
 * @param {string} emailAddress 
 * @returns {Promise} resolve or reject
 */
async function addEmailSubscriber(emailAddress)  {
    try{

        if(listID === undefined)
        {
            // update listID   
            mailChimpIDinfo = await updateListIDandTemplateID()
            listID = mailChimpIDinfo.listID;     
            logger.info(`[addEmailSubscriber] : listID updated : ${listID}`)
        }

        // MCAPI 로 addAud 와 setAud를 실행한다. 
        const res = await MCAPI.setAudienceMember(listID, emailAddress)
        // console.log(res)
        logger.info(`[addEmailSubscriber] : Success / status: ${JSON.stringify(res.status)}`)
        return Promise.resolve(`[addEmailSubscriber] : Success`);
    }
    catch(err)
    {
        return Promise.reject(`[addEmailSubscriber] : Error : ${err}`);
    }
}

module.exports = {  addEmailSubscriber  };