const {logger} = require('../config/logger')
const MCAPI = require('../config/mailChimpAPI')
require('dotenv').config();
const { NODE_ENV } = process.env;


// TODO: Good example of async, await.
const weeklyCampaignSend = async() => {
    try{
        let weekNumber= new Date().getWeek();
        let campaignTitle = undefined;
        let date = new Date();
        /***************************************** */
        if(NODE_ENV === 'test' || NODE_ENV === 'development')
        {
            campaignTitle = `Dwindle Weekly News letter week ${weekNumber}_${date.getHours()}`
        }else{

            campaignTitle = `Dwindle Weekly News letter week ${weekNumber}`;
        }
        /************************* */
        let campaignID = undefined;

        logger.info(`[weeklyCampaignSend]  look up this week's campaign : ${campaignTitle}`);                  
    
      
        await MCAPI.getCampaignList(campaignTitle).then((campaignInfo)=>{
            
            logger.info(`[weeklyCampaignSend] : Is there any "${campaignTitle}" campaign already created?  ${campaignInfo.length>0}`);  
            logger.debug(`[weeklyCampaignSend] : look up result : ${JSON.stringify(campaignInfo)}`);   
            if (campaignInfo.length > 0)
                campaignID = campaignInfo;
        });
    
        if(campaignID.length < 1){
    
                // logger.error(`[MailChimpEmailHandling] weeklyCampaignSend: Error : There is no campaign to send : ${campaignTitle}`);  
                return Promise.reject("[weeklyCampaignSend] :There is no campaign to send");
    
        }else if(campaignID.length > 1)
        {
            logger.error(`[weeklyCampaignSend] : There are more than two campaigns of  ${campaignTitle} , First element will be used`);    
        }
        else{
            logger.info(`[weeklyCampaignSend] : ${campaignTitle} found : ID => ${JSON.stringify(campaignID)}`);
        }
    
        // check out the compaign'status and verify if it is save status 
        // https://mailchimp.com/developer/marketing/api/campaign-content/
        // in case of campaign's status being "save", execute sendCampagin
        const status = await MCAPI.getCampaignStatus(campaignID[0]);
        // console.log(await status);
        if( status === 'save')
        {
            await MCAPI.sendCampaign(await campaignID[0]);
            return Promise.resolve("[weeklyCampaignSend] :success");
        }else
        {
            return Promise.reject(`[weeklyCampaignSend] : campaign status is already "${status}"`);
        }
    }catch(err)
    {
        // logger.error(`[MailChimpEmailHandling] weeklyCampaignSend: error : ${JSON.stringify(err)}`);                  
        return Promise.reject(`[weeklyCampaignSend] : error : ${JSON.stringify(err)}`);
    }
}


module.exports = {
    weeklyCampaignSend
};