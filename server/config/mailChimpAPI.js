const mailchimp = require('@mailchimp/mailchimp_marketing');
const {logger} = require('./logger')
require('dotenv').config();



mailchimp.setConfig({
    apiKey: process.env.MAIL_CHIMP_API_KEY,
    server: process.env.MAIL_CHIMP_API_KEY.split('-')[1]
});

/******API used in updateListIDandTemplateID() ******* */
async function connectionChecker() {
    return mailchimp.ping.get().then((rtn) => {

        logger.info(`[MCAPI][connectionChecker] : ${JSON.stringify(rtn.health_status)}`);
        if(rtn.health_status === "Everything's Chimpy!" )
        {
            return true;
        }else
        {
            return false;
        }
    })
};

// Audience group : pick out audience group that has the same name as an argument /"dwindle"
const getAudienceGroup = async (targetGrpName) => {
     
    // console.log(`Audience List : ${JSON.stringify(response)}`);
    
    return mailchimp.lists.getAllLists().then((audGrp)=> {
        
        logger.info(`[MCAPI][getAudienceGroup] : the total number of audience group ${JSON.stringify(audGrp.lists.length)} `);
        return audGrp.lists.filter((groupinfo) => {
            if(groupinfo.name === targetGrpName )
            {
                logger.info(`[MCAPI][getAudienceGroup] : found the matcing audience group ${JSON.stringify(targetGrpName)} `);
                return true;
            }
            return false;
        });
    });
};

const getAllAudienceGroup = async () => {
     
    // console.log(`Audience List : ${JSON.stringify(response)}`);
    
    return mailchimp.lists.getAllLists().then((audGrp)=> {
        
        logger.info(`[MCAPI][getAllAudienceGroup] : the total number of audience group ${JSON.stringify(audGrp.lists.length)} `);
        return audGrp.lists
    });
  
};

//  get the template list from mailchimp marketing module :
//  This will be used to locate the target template that has the same name as the first arg
//  types : 'user', 'base', 'gallery' => only thing I need is 'user' type
const getTemplateListMrkt = async ( templateName ,option) => {
    return mailchimp.templates.list(option).then((templateLists) => {
        
        logger.info(`[MCAPI][getTemplateListMrkt] : the total number of template group ${JSON.stringify(templateLists.templates.length)} `);
        return templateLists.templates.filter((item) => {
            if(item.name === templateName )
            {
                logger.info(`[MCAPI][getTemplateListMrkt] : found the matching template ${JSON.stringify(templateName)} `);
                return true;
            }
            return false;
        });
    });
};

/********API used in weeklyCampaignCreate() and weeklyCampaignSend *********** */

// getCampaignList does yield the name of campaign / 
// settings.title
const getCampaignList = async (targetCampaignName) => {
    //  only fetch regular type of campaign
    return mailchimp.campaigns.list({type : 'regular'}).then((campaignLists) => {
        // console.log(campaignLists)
        logger.debug(`[MCAPI][getCampaignList] campaign group detail ${JSON.stringify(campaignLists)}`);
        logger.info(`[MCAPI][getCampaignList] the total number of campaign group ${JSON.stringify(campaignLists.campaigns.length)}`);
        return campaignLists.campaigns.filter(campaign => campaign.settings.title === targetCampaignName)
        .map((elem) => {
            // console.log(elem.settings.title);
            return elem.id 
            // {
            //     campaign_id : elem.id,
            //     campaign_title : elem.settings.title
            // };
        })

    });
};

// https://mailchimp.com/developer/marketing/api/campaigns/add-campaign/
const createCampaign = async (list_id, optSetting) => {
    try {

        /* */
        return mailchimp.campaigns.create({
            type: "regular",
            recipients: {
                // segment_opts: {
                //     saved_segment_id: SegmentId,
                //     match: 'any'
                // },
                list_id: list_id
            },
            settings: {
                subject_line: optSetting.subject_line,
                preview_text: optSetting.preview_text,
                title: optSetting.title,
                template_id: optSetting.template_id,
                from_name: optSetting.from_name,
                reply_to: optSetting.reply_to,
                to_name: optSetting.to_name,
                auto_footer: optSetting.auto_footer, //true,
                inline_css: optSetting.inline_css , //true
            }
        }).then((createdCampaign) => {
            logger.info(`[MCAPI][createCampaign] : new campaign created ${JSON.stringify(createdCampaign.id)}`);
            return createdCampaign.id;
        });

    }
    catch (err) {
        // console.log(Object.keys(err.response))
        // console.log(err.response.body)
        logger.error(`[MCAPI][createCampaign] : Error ${JSON.stringify(err)}`);
 
    }
}

const updateCampaignContent = async (campaign_id, contentOpt) => {
    try{
        return mailchimp.campaigns.setContent(campaign_id, contentOpt).then((response)=> {
            logger.info(`[MCAPI][updateCampaignContent] : Content updated `)
            logger.debug(`[MCAPI][updateCampaignContent] : content updated with following detial : ${JSON.stringify(response)}`);
          
        });
    }catch(error)
    {
        logger.error(`[MCAPI][updateCampaignContent] : Error ${JSON.stringify(err)}`);
 
    }
};

// https://mailchimp.com/developer/marketing/api/campaign-content/
// status = { "save", "paused", "schedule", "sending", "sent", "canceled", "canceling", or "archived".}
const getCampaignStatus = async (campaignId) => {
    try {
        return mailchimp.campaigns.get(campaignId).then((campaignStatus) => {
            logger.info(`[MCAPI][getCampaignStatus] ${campaignId} / ${JSON.stringify(campaignStatus.status)}`);
            return campaignStatus.status;
            // it returns null when it is successfully processed
        });
        
    }
    catch (e) {
        logger.error(`[MCAPI][getCampaignStatus] : Error ${JSON.stringify(e)}`);
    }
}

const sendCampaign = async (campaignId) => {
    try {
       
        return mailchimp.campaigns.send(campaignId).then((response) => {
            // it returns null when it is successfully processed
            logger.info(`[MCAPI][sendCampaign] : mail Sent  `);
        });
        
    }
    catch (e) {
        logger.error(`[MCAPI][sendCampaign] : Error ${JSON.stringify(e)}`);
    }
}




/***** MISC ****** */
const getCampaignContent = async (campaign_id) => {
    const response = await mailchimp.campaigns.getContent(campaign_id);
    console.log(response);
};

const getAudienceMembers = async (listId, option) => {
    const response = await mailchimp.lists.getListMembersInfo(listId, option);
    // console.log(response.members);
    const emailArry = response.members.map((elem, key) => {
        console.log(`member #${key} info ${elem.email_address}`);
        return elem.email_address;
    })
    return emailArry;
};

  // how can I get template html file / info about specific template
  // arg is template id
const getSingleTemplateinfoMrkt = async (template_id) => {
    const response = await mailchimp.templates.getTemplate(template_id);
    console.log(`[getSingleTemplateinfoMrkt] : ${JSON.stringify(response)}`);
    console.log(response)
};


 


module.exports = {updateCampaignContent, connectionChecker, createCampaign, getAudienceGroup,getAudienceMembers, getCampaignContent, getCampaignList, getSingleTemplateinfoMrkt, getTemplateListMrkt, sendCampaign, getCampaignStatus, getAllAudienceGroup}