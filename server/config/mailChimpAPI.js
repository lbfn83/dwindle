const mailchimp = require('@mailchimp/mailchimp_marketing');
const {logger} = require('./logger')
require('dotenv').config();



mailchimp.setConfig({
    apiKey: process.env.MAIL_CHIMP_API_KEY,
    server: process.env.MAIL_CHIMP_API_KEY.split('-')[1]
});

/**
 * Check if Mailchimp server is alive or not
 * 
 * @returns {boolean} ture or false 
 */
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
/**
 * This function is searching for the audience group that matches the name passed over as an input arg
 * and returns the corresponding group information
 * 
 * @param {String} targetGrpName / Audience Group name 
 * @returns {JSON} audience group inforamtion  {lists : [{... , name : ''}]}
 * 
 * reference)
 * https://mailchimp.com/developer/marketing/api/lists/get-lists-info/
 */
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



//  
/**
 * Wrapper function for templates.list() API
 * This function is searching for the template that matches the name passed over as an input arg
 * and returns the corresponding template information
 * 
 * 
 * @param {String} templateName 
 * @param {JSON} option {type : 'user', since_date_created : ''}
 * 
 * available types : {'user', 'base', 'gallery'} 
 * 
 * @returns {Promise<JSON>} template information { templates : {... , name : ''}}
 * reference)
 * https://mailchimp.com/developer/marketing/api/templates/list-templates/
*/
const getTemplateListMrkt = async (templateName) => {
    try{
        const numOfitemsPerPage = 100; // 1000 is max
        let option = {
            //  only fetch regular type of campaign
            type : 'user',
            // since_date_created : '',
            count : numOfitemsPerPage,
            offset : 0
        };
        let resultList = [];
        logger.debug(`[MCAPI][getTemplateListMrkt] The expected number of templates included in this query : ${numOfitemsPerPage}`);
        await mailchimp.templates.list(option).then(async(templateLists) => {
        
            logger.info(`[MCAPI][getTemplateListMrkt] : the number of template groups delievered in a first query :  ${JSON.stringify(templateLists.templates.length)} `);
            // Destructuring required to keep it a single dimension 
            resultList.push(...templateLists.templates);
            logger.info(`[MCAPI][getTemplateListMrkt] the total number of groups in the server : ${JSON.stringify(templateLists.total_items)} / Recursive call requried ? ${templateLists.total_items > numOfitemsPerPage}`);
        
            // Pagination : To receive the next page, change param and make another query with it
            option.offset = Number(numOfitemsPerPage) + Number(option.offset);
            if(templateLists.total_items > templateLists.templates.length)
            {
                do {
                    await mailchimp.templates.list(option).then((templateLists) => {
                        logger.info(`[MCAPI][getTemplateListMrkt][InnerLoop] the number of campaign groups delievered ${JSON.stringify(templateLists.templates.length)}`);
                        resultList.push(...templateLists.templates);
                    });
                    option.offset = Number(numOfitemsPerPage) + Number(option.offset);
    
                } while(option.offset < templateLists.total_items )
            }
        
        });
        return resultList.filter((item) => {
            if(item.name === templateName )
            {
                logger.info(`[MCAPI][getTemplateListMrkt] : found the matching template ${JSON.stringify(templateName)} `);
                return true;
            }
            return false;
        });
    }catch(err)
    {
        logger.error(`[MCAPI][getTemplateListMrkt] : error ${JSON.stringify(err.response)}`)
        return Promise.reject(`[MCAPI][getTemplateListMrkt] : failed due to ${err}`)

    }
  
 
 
};




/**
 * Wrapper function for campaigns.list() API
 * Only sends out 10 campaign items per query as defualt.
 * Therefore, change Query param 'count' as 1000(maximum)
 * total_items key should be referenced to get the toal number of campaigns
 * When there are multiple campaigns with the same name, the ID of the first campaign 
 * comes up in a map iterator will return 
 * 
 * @param {String} targetCampaignName 
 * @returns {Promise<String>} ID of the target campaign 
 * reference)
 * https://mailchimp.com/developer/marketing/api/campaigns/list-campaigns/
 */
const getCampaignList = async (targetCampaignName) => {
    try{
        const numOfitemsPerPage = 100; // 1000 is max
        let option = {
            //  only fetch regular type of campaign
            type : 'regular',
            count : numOfitemsPerPage,
            offset : 0
        };
        let resultList = [];
        logger.debug(`[MCAPI][getCampaignList] The expected number of campaigns included in this query : ${numOfitemsPerPage}`);
        await mailchimp.campaigns.list(option).then(async(campaignLists) => {
            logger.debug(`[MCAPI][getCampaignList] campaign group detail ${JSON.stringify(campaignLists)}`);
            logger.info(`[MCAPI][getCampaignList] the number of campaign groups delievered in a first query : ${JSON.stringify(campaignLists.campaigns.length)}`);
            // Destructuring required to keep it a single dimension 
            resultList.push(...campaignLists.campaigns);
            
            logger.info(`[MCAPI][getCampaignList] the total number of groups in the server : ${JSON.stringify(campaignLists.total_items)} / Recursive call requried ? ${campaignLists.total_items > numOfitemsPerPage}`);            if(campaignLists.total_items > numOfitemsPerPage)
            
            // Pagination : To receive the next page, change param and make another query with it
            option.offset = Number(numOfitemsPerPage) + Number(option.offset);
            if(campaignLists.total_items > campaignLists.campaigns.length)
            {
                do {
                    await mailchimp.campaigns.list(option).then((campaignLists) => {
                        logger.info(`[MCAPI][getCampaignList][InnerLoop] the number of campaign groups delievered ${JSON.stringify(campaignLists.campaigns.length)}`);
                        resultList.push(...campaignLists.campaigns);
                    });
                    option.offset = Number(numOfitemsPerPage) + Number(option.offset);
    
                } while(option.offset < campaignLists.total_items )
            }
                       
        });

        // console.log(resultList.length)
        return resultList.filter(campaign => campaign.settings.title === targetCampaignName)
        .map((elem) => {
            // console.log(elem.settings);
            logger.info(`[MCAPI][getCampaignList] Campaign ID with name '${targetCampaignName}' => ${elem.id}`);
            return elem.id; 
        });
       
    }catch(err)
    {
        logger.error(`[MCAPI][getCampaignList] : error ${JSON.stringify(err.response)}`)
        return Promise.reject(`[MCAPI][getCampaignList] : failed due to ${err}`)
    }
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


/**  
 * Wrapper function for setListMember() API
 * This function is handling both of adding (subscribed status) and updating (pending status) members to the audience group, 
 * whose name is predefined with AUD_GRP_NAME variable in weeklyEmailCampaignCreateAndUpdate. 
 * . 
 * Exception ) In case of having a certain member permanently deleted, the reactivation of 
 * that account should be done by using a MailChimp signup form as opposed to using an API method provided.
 *
 *  @param {string} listID
 *  @param {string} email_address
 *  @returns {Promise<JSON>} A Promise of setListMember's response
 *  @customfunction
 * 
 * Reference Website ) 
 * https://mailchimp.com/developer/marketing/api/list-members/add-or-update-list-member/
 * https://mailchimp.com/help/resubscribe-a-contact/
 * https://stackoverflow.com/questions/52198510/mailchimp-resubscribe-a-deleted-member-causes-the-api-to-return-a-400-bad-reques
*/
const setAudienceMember = async (listId, email) => {
    try {
        const response = await  mailchimp.lists.setListMember(listId, email,  {
            email_address: email,
            // possible values : "subscribed", "unsubscribed", "cleaned", "pending", or "transactional"
            status: 'pending',
            status_if_new: 'subscribed',
            email_type: 'html',
            // merge_fields: {
            //     FNAME: firstname,
            //     LNAME: lastname
            // },
            // tags: [tag]
        })
        // console.log(response)
        logger.info(`[MCAPI][setAudienceMember] : member subscribed  `);
        return Promise.resolve(response)
    }
    catch (err) {
        logger.error(`[MCAPI][setAudienceMember] : error ${JSON.stringify(err.response.text)}`)
        return Promise.reject('[MCAPI][setAudienceMember] : member subscription failed')
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


module.exports = {setAudienceMember, updateCampaignContent, connectionChecker, createCampaign, getAudienceGroup,getAudienceMembers, getCampaignContent, getCampaignList, getSingleTemplateinfoMrkt, getTemplateListMrkt, sendCampaign, getCampaignStatus}