const { logger } = require('../config/logger');
const { sequelize } = require('../models');
require('dotenv').config();
// const { MAIL_CHIMP_BENEFIT_TYPE } = process.env;
const BENEFIT_TYPES = require('../static/benefit_type');
const MAX_JOBPOSTING_PER_COMPANY = 10;
const NUMBER_OF_COMPANIES_TO_PICK = 3;
/**
 * Pick top three companies that have most jobpostings this week
 * and calculate their respective counts of jobpostings in each location( no longer vaild on 10/15/2022, only USA is a valid location)
 * Doesn't take account of soft deleted jobpostings or jobpostings generated more than a week ago .
 * @param {String} benefitType any of ['student_loan_repayment', 'tuition_assistance', 'tuition_reimbursement', 'full_tuition_coverage'] or if empty string is passed, most active hiring companies will be picked
 * @returns {Array} Array of the below Object => 
 *      
 *      {   
 *          company_name : string,
 *  
 *          company_summary : string,
 *          
 *          company_imagelink : URL TEXT
 * 
 *          total_count : number,
 * 
 *          count_per_loc: { 
 *                              
 *                              'USA' : number,
 * 
 *                              'CANADA' : number,
 *                          }
 *      }
 */
 const fetchCompanyInformation = async (benefitType) => {
    try {
        
        // If MAIL_CHIMP_BENEFIT_TYPE is defined with one of ['student_loan_repayment', 'tuition_assistance', 'tuition_reimbursement', 'full_tuition_coverage']
        // companies that offer that benefit type and have most jobpostings this week will be picked
        let SQLBenefitCond = '';

        // argument check
        if(benefitType !== undefined && benefitType !== '')
        {
            if(BENEFIT_TYPES.indexOf(benefitType) > -1 ){
                SQLBenefitCond = `and benefitInfo.benefit_type_array @>'{${benefitType}}'`;
            }else{
                throw Error(`benefit type can be one of ['student_loan_repayment', 'tuition_assistance', 'tuition_reimbursement', 'full_tuition_coverage']`)
            }
        }
        logger.info(`[weeklyEmailDynamicContent]  MAIL_CHIMP_BENEFIT_TYPE env var : ${benefitType}`);

        
        // Pick top three companies that have most jobpostings this week
        // result columns ( refre to first element of the result ) : mode, count, company_summary
        // exclude soft-deleted entries

        // Previous Version
        // const threeCompanies = await sequelize.query(`SELECT stat.*, company.company_summary, company.imagelink from 
        //     (
        //         SELECT mode() WITHIN GROUP (ORDER BY jobposting.company_name), count(*)
        //         from jobposting where jobposting."deletedAt" is null group by jobposting.company_name order by count desc limit 3
        //     ) 
        // as stat INNER JOIN company on company.company_name = stat.mode`);
 
        const threeCompanies = await sequelize.query(`select JPcount.*, company.imagelink, company.company_summary from
        (
            select jobposting.company_name , count(*), benefitInfo.benefit_type_array from 
            (
                       SELECT benefit.company_name , array_agg(benefit.benefit_type) as benefit_type_array
                       FROM benefit where benefit."deletedAt" is null group by benefit.company_name
            ) as benefitInfo join jobposting on benefitInfo.company_name = jobposting.company_name
            where jobposting."deletedAt" is null and jobposting.posted_date >= NOW() - interval '7 day'  ${SQLBenefitCond}
            group by jobposting.company_name, benefitInfo.benefit_type_array order by count desc limit ${NUMBER_OF_COMPANIES_TO_PICK}
        ) as JPcount LEFT JOIN company on company.company_name = JPcount.company_name`);

        logger.info(`[weeklyEmailDynamicContent] fetchCompanyInformation : three companies picked : ${JSON.stringify(await threeCompanies[0])}`)

        // https://stackoverflow.com/questions/33438158/best-way-to-call-an-asynchronous-function-within-map
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
        // The Promise.all() method takes an iterable of promises as an input, and returns a single Promise that resolves to an array of the results of the input promises.
        //  This returned promise will fulfill when all of the input's promises have fulfilled, or if the input iterable contains no promises.

        // As of August, 2022, the United states is the only location for all the jobpostings
        // Therefore, the below logic is redundant for now, but for the future I will leave them here 
        // exclude soft-deleted entries
        const countingPerLoc = await Promise.all(threeCompanies[0].map(async (company, index) => {
            const eachJobcounting = await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
            WHERE jobposting.company_name = '${company.company_name}' and "deletedAt" is null and jobposting.posted_date >= NOW() - interval '7 day' group by jobposting.normalized_job_location`);
            // each elem of eachJobcounting : [ { mode: 'USA', count: '470' }, { mode: 'CANADA', count: '372' } ]
            // console.log(eachJobcounting[0]);
            // reduce
            // https://betterprogramming.pub/6-use-cases-for-reduce-in-javascript-49683842ebed
            return eachJobcounting[0].reduce((prev, elem) => {
                prev['company_name'] = company.company_name;
                prev['company_summary'] = company.company_summary;
                prev['company_imagelink'] = company.imagelink;
                prev['company_benefit'] = company.benefit_type_array;
                prev['total_count'] = company.count;
                if (prev['count_per_loc'] === undefined) {
                    prev['count_per_loc'] = {};
                }

                prev['count_per_loc'][`${elem.mode}`] = elem.count;

                // Version 1.0
                // https://code-boxx.com/convert-string-object-javascript/
                // prev['count_per_loc'].push(JSON.parse(
                //     `{"${elem.mode}" : "${elem['count']}"}`));

                // prev[elem.mode] = elem.count;

                return prev;
            }, {});

        })
        );

        // the object structure example
        // {
        //     company_name: 'Deloitte',
        //     company_summary: 'Deloitte drives progress. Our firms around the world help clients become leaders wherever they choose to compete.',
        //     total_count: '806',
        //     count_per_loc: { USA: '450', CANADA: '356' }        
        //   }
        logger.info(`[weeklyEmailDynamicContent] fetchCompanyInformation :jobposting counts per location : ${JSON.stringify(await countingPerLoc)} `)

        return countingPerLoc;

    } catch (error) {
        return Promise.reject(`[weeklyEmailDynamicContent] fetchCompanyInformation : Error "${error}"`);
    }
}



function getRandomInt(min = 0, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate 10 random numbers for each company, 
 * which would be used as indices to pick and choose its jobpostings
 * 
 * @param {Array} companyInfo three companys' Information
 * 
 *          { company_name : string,
 *          company_summary : string,
 *          total_count : number,
 *          count_per_loc: {    'USA' : number,
 *                              'CANADA' : number,}}
 * 
 *  
 * @returns {Array} {...companyInfo, jobposting : [{},{}...]}
 * 
 */
const fetchJobPostingInformation = async (companyInfo) => {
    try {
        logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation :jobposting counts per location :  `);

        // Version 1.0
        // let a = companyInfo[0].count_per_loc.reduce((prev, elem) => {
        //     prev[Object.keys(elem)] = Math.round(MAX_JOBPOSTING_PER_COMPANY * (elem[Object.keys(elem)] /  companyInfo[0].total_count));
        //     return prev;
        // }, {})

        return Promise.all(companyInfo.map(async (singleCompanyInfo) => {
            let actualNumOfJPfromEachLoc = {}; // for debugging purpose
            let randNumSets = []; // this is for debugging purpose

            // create New key to store jobposting information
            singleCompanyInfo.jobpostings = [];
            // Not valid anymore since USA is only location 10/15/2022 :
            //  Go through each location [USA, CANADA] and calculate/allocate quotas of each location for MailChimp posting according to the ratio of total jobpostings   
            for (singleLoc of Object.keys(singleCompanyInfo.count_per_loc)) {
                // console.log(singleLoc);
                // for example 5.5 and 4.5 then it will have one more job posting. However, putting out one more job posting won't do any harm I think
                actualNumOfJPfromEachLoc[`${singleLoc}_NumOfJP`] = Math.round(parseFloat(MAX_JOBPOSTING_PER_COMPANY) * (singleCompanyInfo.count_per_loc[singleLoc] / singleCompanyInfo.total_count));

                logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation : ${singleLoc} should pull ${actualNumOfJPfromEachLoc[`${singleLoc}_NumOfJP`]} jobs out of total ${MAX_JOBPOSTING_PER_COMPANY}`);

                let randNumSet = new Set();
                let loopCond = parseInt(actualNumOfJPfromEachLoc[`${singleLoc}_NumOfJP`]);
                while (randNumSet.size < loopCond) {
                    // Random numbers genertaed that are less than the total number of jobpostings each company has in each location
                    let temp = getRandomInt(0, singleCompanyInfo.count_per_loc[singleLoc] - 1);
                    randNumSet.add(temp);
                }

                randNumSets.push(randNumSet);
                // exclude soft-deleted jobpostins and jobpostings generated more than a week ago
                const result = await sequelize.query(`select * from jobposting where jobposting.company_name='${singleCompanyInfo.company_name}' 
                and jobposting.normalized_job_location= '${singleLoc}' and "deletedAt" is null and jobposting.posted_date >= NOW() - interval '7 day' `);

                // Push selected jobpostings with the randomly generated indices among the total query result from DB 
                for (index of randNumSet) {
                    singleCompanyInfo.jobpostings.push(result[0][index])
                }
            }
            logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation actual job posting count by loc : ${singleCompanyInfo.company_name} =>  ${JSON.stringify(actualNumOfJPfromEachLoc)}`);
            randNumSets.forEach((eachSet, idx) => {
                // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/from
                logger.info(`[weeklyEmailDynamicContent] fetchJobPostingInformation :  ${singleCompanyInfo.company_name} => Set ${idx} ::: ${Array.from(eachSet)} `);
            })
            return singleCompanyInfo;
        }));

    } catch (error) {
        return Promise.reject(`[weeklyEmailDynamicContent] fetchJobPostingInformation : Error "${error}"`);
    }
}

/**
 * char Encoding in HTML for weekly email
 * @param comInfoWithJPs =>  {...companyInfo, jobposting : [{},{}...]}
 * 
 */
const charEncodingInHTML = (comInfoWithJPs) => {
    try {
        let body = `
        <table cellspacing="0" cellpadding="0" style="border:0px;width:100%;">
        `

        comInfoWithJPs.map((eachCompanyInfoWithJP) => {
            body += `<tr>
                        <td>
                            <br>
                            <br>
                        </td>
                    </tr>        
                    <tr class="companies-container">
                        <td colspan="2">
                            <div class="company-header"> 
                                <div class="company-image-container">
                                    <img src="${eachCompanyInfoWithJP.company_imagelink}"> 
                                    </div>
                                <div class = "company-title" >
                                    <h2>${eachCompanyInfoWithJP.company_name}</h2>
                                </div>
                            </div>
                            <h4>${eachCompanyInfoWithJP.company_summary}</h4>
                        </td> 
                    </tr>
                    <tr >
                        <td >
                            <br>
                        </td>
                    </tr>   
                    `
            for (eachJP of eachCompanyInfoWithJP.jobpostings) {
                // mailchimp can't take p tag wrapped in a tag. what a weird platform..
                //            <sup style = "font-size: 13px;font-weight: 400;color: #777770;>${eachJP.company_name}</sup>  
                // <span style="padding-left:20px;">${eachJP.job_title}</p>

                body += `<tr class="jobposting-container" >
                            <td class="jobposting-container-left" >            
                                <a class="jobposting-link-left" href="${eachJP.linkedin_job_url_cleaned}" target="_blank">
                                    <sup style = "font-size: 10px;font-weight: 400;color: #777770;">${eachJP.company_name}</sup>
                                    <div style="padding-left:20px;background: none;padding-bottom: 10px;padding-top: 3px;">${eachJP.job_title}</div>    
                                </a>
                            </td>
                            <td class="jobposting-container-right" >
                                <a class="jobposting-link-right" href="${eachJP.linkedin_job_url_cleaned}"  target="_blank">
                                    <span class="jobposting-span-text">${eachJP.job_location}</span>
                                </a>
                            </td>
                        </tr>
                       `
            }
            body += `<tr>
                        <td>
                            <br>
                            <br>
                            <br>       
                        </td>
                    </tr>
                    `

        })

        body += `</table>`
        logger.debug(`[weeklyEmailDynamicContent] charEncodingInHTML : Generated HTML Content for email : 
        ${body}`);

        return body;
    } catch (error) {
        // return Promise.reject(`[weeklyEmailDynamicContent] charEncodingInHTML : Error "${error}"`); 
        return `error : ${error}`;
    }
}





/**
 * Organize the text containing three companys' infomation and their jobpostings 
 * and encode it to its HTML equivalent to embed it to the weekly email 
 * @param {String} benefit_type : one of the benfit types => ['student_loan_repayment', 'tuition_assistance', 'tuition_reimbursement', 'full_tuition_coverage']
 *                   If arg is empty string, it will pick
 * @returns {String} : String with HTML TAGs 
 */
const dyanmicConentBuilder = async (benefit_type) => {
    try {
        logger.info(`[weeklyEmailDynamicContent] dyanmicConentBuilder : started!`);
        let companyInfo = await fetchCompanyInformation(benefit_type);

        // console.log(companyInfo);
        const comInfoWithJPs = await fetchJobPostingInformation(companyInfo);

        logger.debug(`[weeklyEmailDynamicContent] dyanmicConentBuilder : Aggregated Content right before char encoding : 
        ${JSON.stringify(comInfoWithJPs)}`);


        return Promise.resolve(charEncodingInHTML(comInfoWithJPs));
    }
    catch (err) {
        logger.error(`[weeklyEmailDynamicContent] dyanmicConentBuilder : Error /  ${err}`);
        return Promise.reject(`[weeklyEmailDynamicContent] dyanmicConentBuilder : Error "${err}"`);
    }
}

module.exports = {
    dyanmicConentBuilder
};

/*
const weeklyEmailJobpostingPull = async() => {
    // Pick top three companies that have most jobposting this week
    // columns : mode, count, company_summary
    const threeCompanies = await sequelize.query(`SELECT stat.*, company.company_summary from 
        (
            SELECT mode() WITHIN GROUP (ORDER BY jobposting.company_name), count(*)
            from jobposting group by jobposting.company_name order by count desc limit 3
        ) 
    as stat INNER JOIN company on company.company_name = stat.mode`);

    let finalResult = [];
    console.log(await threeCompanies[0])
    console.log(`${JSON.stringify(await threeCompanies[0])}`);
            

        // Below is for looping through obejct's keys 
        // for( mode in threeCompanies[0])
        // should use 'of'

        // await threeCompanies[0].forEach(async(company) => {
        //     await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
        //     WHERE jobposting.company_name = '${company.mode}' group by jobposting.normalized_job_location`)
        //     .then((result)=> {
        //         console.log(result)
        //         finalResult.push(result)
        //     });    
        // })
    await threeCompanies[0].map(async(company)=> {
        await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
            WHERE jobposting.company_name = '${company.mode}' group by jobposting.normalized_job_location`)
        .then(async(result)=> {
            // console.log(await result)
            finalResult.push(await result[0])
            if(finalResult.length ===3)
            {
                console.log(finalResult)
                console.log("hahaha")
            }
        });    
    })
    */
/*
await sequelize.query(`SELECT stat.*, company.company_summary from 
    (
        SELECT mode() WITHIN GROUP (ORDER BY jobposting.company_name), count(*)
        from jobposting group by jobposting.company_name order by count desc limit 3
    ) 
as stat INNER JOIN company on company.company_name = stat.mode`)
 
.then(async(threeCompanies) => 
{
    let finalResult = [];
    console.log(`${JSON.stringify(threeCompanies[0])}`);
    if(threeCompanies[0].length === 3)
    {
        threeCompanies[0].map(async(company)=> {
            await sequelize.query(`SELECT mode() WITHIN GROUP(ORDER BY jobposting.normalized_job_location), COUNT(*) from jobposting 
                WHERE jobposting.company_name = '${company.mode}' group by jobposting.normalized_job_location`)
            .then((result)=> {
                // console.log(result)
                finalResult.push(result)
            });    
        })
        if( finalResult.length ===3 )
        {
            console.log(finalResult)
        }l
       
 
    }
});
*/

