const {logger} = require('../config/logger');
const MCAPI = require('../config/mailChimpAPI');


var listID = undefined;
const AUD_GRP_NAME = "Dwindle Student Debt";
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
            mailChimpIDinfo = await updateListID();
            listID = mailChimpIDinfo.listID;     
            logger.info(`[addEmailSubscriber] : listID updated : ${listID}`)
        }
        if(await checkAlreadyMember(listID, emailAddress))
        {
            return Promise.resolve(`${emailAddress} is already subscribed.`);
        }else
        {
            // MCAPI 로 addAud 와 setAud를 실행한다. 
            const res = await MCAPI.setAudienceMember(listID, emailAddress)
            // console.log(res)

            /** setAudienceMember response type 
             * pending is returned when the existing email address is registered again
            */
            // info : Sep-01-2022 10:28:27 :   [MCAPI][setAudienceMember] : member subscribed  
            // info : Sep-01-2022 10:28:27 :   [addEmailSubscriber] : Success / status: "pending"
            // info : Sep-01-2022 10:29:13 :   [MCAPI][setAudienceMember] : member subscribed  
            // info : Sep-01-2022 10:29:13 :   [addEmailSubscriber] : Success / status: "subscribed"
            logger.info(`[addEmailSubscriber] : Success / status: ${JSON.stringify(res.status)}`)
            return Promise.resolve(`${emailAddress} is successfully registered. Thanks for subscribing!`);
        }
    }
    catch(err)
    {
        return Promise.reject(`[addEmailSubscriber] : Error : ${err}`);
    }
}
async function checkAlreadyMember(listID, emailAddress)  {
    const subscriberList = await MCAPI.getAudienceMembers(listID, "subscribed");
    if(subscriberList.includes(emailAddress))
    {
        return true;
    }else{
        return false;
    }

}
/** */
async function updateListID()  {
    try{
        await MCAPI.connectionChecker().then(async(connected)=>{
            if(connected)
            {
                // Audience Group List ID update
                logger.info(`[updateListID] : MailChimpo Connected `)
                await MCAPI.getAudienceGroup(AUD_GRP_NAME).then((groupinfo) => {
                    // console.log(groupinfo.length)
                    if(groupinfo.length === 0)
                    {   
                        throw Error(`[updateListID] : getAudienceGroup failed`);
                    }else
                    {
                        logger.info(`[updateListID] : MailChimpo selected audience group name : ${JSON.stringify(groupinfo[0].name)} `);
                        logger.debug(`[updateListID] : MailChimpo audience group information : ${JSON.stringify(groupinfo)} `);
                        listID = groupinfo[0].id;
                        logger.info(`[updateListID] : audience listID updated : ${JSON.stringify(groupinfo[0].id)}`);
                    }
                })

            }else{
                return Promise.reject(`[updateListID] : mailchimp server connection failed`);
            }
        });   
        logger.info(`[updateListID] : Success`)
        return Promise.resolve({
            listID : listID,
        });         
    }catch(err)
    {
        // logger.error(`[MailChimpEmailHandling] updateListIDandTemplateID: error : ${JSON.stringify(err)}`);                  
        return Promise.reject(`[updateListID] : Error : ${err}`);
    }
}


module.exports = {  addEmailSubscriber, updateListID  };