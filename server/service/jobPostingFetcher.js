
const fs = require("fs");
const axios = require('axios');
const db = require('../models')
const company = db.company;
const jobposting = db.jobposting;
const loc_lookup = db.loc_lookup;
const { logger } = require('../config/logger');
require('dotenv').config();
const {v4}  = require('uuid')

const MaxPageToProbe = 4; // In case of not using page limit, please put undefined or comment this line out


function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
};


/**
 * Compile the list of companies in a company table to build query options for 
 * the RapidAPI linkedIn webscraper.
 * 
 * @returns {Promise} the result of queries
 */
async function pullJobPostings() {
    try {
        const dateLib = new Date();
        const dateStr = (dateLib.toDateString(Date.now()) + " " + dateLib.getHours()).replace(/\s/g, '_');

        /* Manual logging file creation is replaced by winston logger */

        // fs.promises.mkdir('./Log', { recursive: true }).catch(console.error);

        // var Logging = fs.createWriteStream(`./Log/logging${dateStr}.txt`, {
        // flags: 'a' // 'a' means appending (old data will be preserved)
        // })

        //  gotta add Daily Scrape column in company table and
        // add "where" to filter out those companies marked with false in this column
        const companyDBentries = await company.findAll({
            where: {
                job_scraper: true
            }
        })//.then((entries ) => {console.log("[Company DB entri]",entries)})
        const companyList = companyDBentries.map((element) => element.company_name);

        // Due to the different benefit policies, CANADA should be reconsidered
        // const country = ['USA', 'CANADA']
        const country = ['USA'];

        logger.info(`JobPosting Fetcher invoked : ${dateStr}`);
        // Logging.write("<<<<<<<<"+ dateStr +">>>>>>>>>>")

        // Logging.write("\n------Company List---------\n")

        // companyList.forEach((each) => {
        //     Logging.write(each+'\n')
        // }) 
        // Logging.write("\n------------------------\n")

        let combinedList = [];

        country.forEach((loc) => {
            let result = companyList.map((comName) => {
                return {
                    "company": comName,
                    "location": loc
                }
            })
            combinedList = [...combinedList, ...result]
            logger.debug(`[JobPosting Fetcher] the generated list for query: ${combinedList}`);

        });

        let results = [];

        async function setupQueryOption(item, cb) {
            var queryOption = {
                method: 'POST',
                url: 'https://linkedin-jobs-search.p.rapidapi.com/',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
                    'X-RapidAPI-Key': `${process.env.RAPID_API_API_KEY}`
                },

                data: `{"search_terms":"${item.company}","location":"${item.location}","page":"1","fetch_full_text": "yes"}`
            };
            await processAPIRequestAndSQL(queryOption, item.company, item.location).then((rtn) => {
                // res.write(JSON.stringify(rtn)+"/n")
                results.push(rtn)
                cb(rtn);
            });
        }

        /*Asynchornous way : 429 error returned*/

        // https://stackabuse.com/how-to-split-an-array-into-even-chunks-in-javascript/
        // slice combinedList into size of 4 or 5 and each chuck runs its elements asynchonously??
        // taskChunks= sliceIntoChunks(combinedList, 2 )

        // for(const singleTaskChunk of taskChunks)
        // {
        //     const promisePooltaskChunk = singleTaskChunk.map((item) => {
        //         // console.log("[item]",  item)
        //         return new Promise((resolve) => {
        //             setupQueryOption(item, resolve);
        //         });
        //     })
        //     await Promise.all(promisePooltaskChunk).then( (results) => {
        //         // The return value of Promise.all is "," which is odd
        //         // results.push({"fetched" : " done "})
        //         results.forEach((elem)=> {
        //             Logging.write("[jobpostingfetcher result] : \n")
        //             Logging.write(JSON.stringify(elem) + '\n')
        //         }) 
        //     }) 
        // }

        /* full on Asynchronous way : 429 error returned */
        // // Promisify
        // const promisePoolSearchKeywords = combinedList.map((item) => {
        //     // console.log("[item]",  item)
        //     return new Promise((resolve) => {
        //         setupQueryOption(item, resolve);
        //     });
        // })
        // // let rtnResult = undefined
        // await Promise.all(promisePoolSearchKeywords).then( () => {
        //     // The return value of Promise.all is "," which is odd

        //     // results.push({"fetched" : " done "})

        //     results.forEach((elem)=> {
        //         Logging.write("[jobpostingfetcher result] : \n")
        //         Logging.write(JSON.stringify(elem) + '\n')
        //     })
        //     console.log("[jobpostingfetcher task complete]")
        //     // Async Await ... complex concept ... forgot to put return in outer loop 
        //     // also forgot to put await in Promise.all
        //     // which caused malfunction of this function  
        //     // that was not returning promise( return value )  

        //     // rtnResult = new Promise((resolve) => resolve(results))

        // }); 


        /* Synchronous Way : too slow but required to work around the error from server*/
        for (const singleQuery of combinedList) {
            // await sleep(10000)
            logger.info(`[jobpostingfetcher single query] : ${JSON.stringify(singleQuery)}`)
            await setupQueryOption(singleQuery, (rtn) => {
                if (rtn.fetched.page) {
                    logger.info(`[jobpostingfetcher result] finished before page ${rtn.fetched.page}`)
                } else {
                    logger.error(`[jobpostingfetcher result] error : ${rtn.fetched}`)
                }

            })
        };

        return Promise.resolve(results);//rtnResult
    }
    catch (err) {
        // console.log("[jobpostingfetcher error] : "+ err);
        logger.error(`[jobpostingfetcher error] : ${JSON.stringify(err)}`);
        // Logging.write("[jobpostingfetcher error] : "+ err + "\n")
        return Promise.reject({ "error": err });
    }

}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Importing test data for address standardization 
// let jobpostingTestData = require('./jobpostingFetching_test/jobposting_test_data');

// Importing test data for filtering out keywords
let jobpostingTestData = require('./jobpostingFetching_test/jobpositng_test_keywords_Intern_Contract');
const {doesFilteringKeywordsExistInJP} = require('./filteringKeywords');

/**
 * A function that sends a request to query job postings to the RapidAPI linkedIn webscraper.
 * companyName is there to filter out any job postings that have different company names.
 * Future : this function might be improved by extracting companyName and loc directly from queryOption 
 * 
 * @param {JSON} queryOption Option details are specified in https://rapidapi.com/jaypat87/api/linkedin-jobs-search/
 * @param {String} companyName In case of test mode, pass '' to this arg
 * @param {String} loc In case of test mode, pass '' to this arg
 * @param {Boolean} testmode This is to test an address standardization feature
 * @returns 
 */
async function processAPIRequestAndSQL(queryOption, companyName, loc, testmode = false) {
    try {
        /* Synchronous Way with sleep : too slow but required to work around the error from server*/
        await sleep(10000);

        logger.info(`[processRequest] queryOption : ${testmode?'this is test':queryOption.data}`);
        // Logging.write("\n------API response---------\n")
        // Logging.write("\n---queryOption : " + queryOption.data + "----\n")

        // const result = await axios.request(queryOption)

        const pageNum =testmode? -1 : JSON.parse(queryOption.data).page;
        let result = undefined;
        if (testmode) {
            jobpostingTestData.data.forEach((jp) => {
                // since this is test , all the entries should be soft deleted? nope...
                // Input data having non null values at deletedAt column doens't really affect 
                // the records in the database. Sequelize doesn't take into account of updatedAt, deletedAt
                // columns in input data set 
                // as if these columns should be treated as system default values that user shouldn't touch
                // let today = new Date();
                // jp.deletedAt = today.toLocaleString(); 


                delete jp.uuid;
                delete jp.createdAt;
                delete jp.updatedAt;
                delete jp.benefit_type_array;
                delete jp.student_loan_repayment;
                delete jp.tuition_reimbursement;
                delete jp.tuition_assistance;
                delete jp.full_tuition_coverage;
                delete jp.std_loc_str;
                delete jp.jobpostingToken;
            });
            result = jobpostingTestData;
            
        } else {
            if (MaxPageToProbe === undefined || MaxPageToProbe >= pageNum) {
                result = await axios.request(queryOption);
            } else {
                result = {
                    headers: { messege: `MaxPageToProbe (${MaxPageToProbe}) limit reached` },
                    config: { data: [] }
                };
                logger.info(`[processRequest] MaxPageToProbe (${MaxPageToProbe}) limit reached.`);

            }
            // Mostly the ratelimit information is included in the response header but sometimes not
            if ('x-ratelimit-requests-remaining' in result.headers) {
                logger.info(`[processRequest] Rate limit remaining : ${result.headers["x-ratelimit-requests-remaining"]}`);
            } else {
                logger.info(`[processRequest] Rate limit info is not passed over in the header`);
            }
        }

        // condition = result.hasOwnProperty('data') && result.data !== undefined && result.data.length > 0

        if (result.hasOwnProperty('data') && result.data.length > 0 ) {
            logger.info(`[processRequest] rowData length : ${JSON.stringify(result.data.length)}`);
            // Logging.write("[Rate limit remaining]: " + JSON.stringify(result.headers["x-ratelimit-requests-remaining"]))
            // Logging.write("[rowData length] : " + JSON.stringify(result.data.length) + "[rowData End]\n")  
            logger.info(`[processRequest] rowData  : ${JSON.stringify(result.data)}`);
            result.data.forEach(async (element) => {
                // Logging.write("[eachElem] : " + JSON.stringify(element) + "\n")

                // If API sends wrong data having different company name, simply ignore 
                // Chegg INC from API.. our database Chegg
                // Natixis assurance from API ... our database Natxis
                if (element.company_name.includes(companyName) ||testmode) {
                    if(!doesFilteringKeywordsExistInJP(element))
                    {
                        element.normalized_company_name = testmode?'test':element.normalized_company_name;
                        element.normalized_job_location = testmode?'USA':loc;
                        // foreign key constraint ... can't put test here
                        element.company_name = testmode?element.company_name:companyName;
                        // primary key should be unique so that uuid generator is introduced in here
                        // element.linkedin_job_url_cleaned = testmode?v4():element.linkedin_job_url_cleaned;
                        element.linkedin_job_url_cleaned = testmode?element.linkedin_job_url_cleaned+' test':element.linkedin_job_url_cleaned;
                       
                        /* The problem with below is that it doens't update the found data entry 
                        
                        Motivation : 
                        on daily basis, jobposting database should be updated with new or existing jobposting data pulled from API query
                        if existing data entry matches any of this new stream of data from API query, we simply 
                        update UpdatedAt column as current timestamp so it is not the target of soft-deletion*/
                        /*
                        const [elemFound, created] = await jobposting.findOrCreate({
                            where: { linkedin_job_url_cleaned: element.linkedin_job_url_cleaned },
                            defaults: element
                        });
                        // when created is false, it is just updated
                        Logging.write("Created? : "+ created + "//" + elemFound +"\n")
                        */
    
    
                        /* Address standardization */
                        let stdStr = undefined;
                        await loc_lookup.convertToStdAddr(element.job_location, logger)
                            .then(result => stdStr = result).catch(err => stdStr = err);
    
                        element.std_loc_str = stdStr;
                        // if the jobposting is marked with a deletion flag, execute the soft-deletion to it.
                        if (stdStr === 'deletion flag') {
                            let today = new Date();
                            element.deletedAt = today.toLocaleString();
                        }else{
                            // This doesn't seem to overwrite deleteadAt coulmun of existing record
                            // sequelize's misbehavior beyond understanding
                            element.deletedAt = null;
                        }
    
    
                        /* Insert new jobposting item or Update existing DB entry corresponding to jobposting item*/
                        /* Since RapidAPI's data set is inconsistent, some of jobpostings that was already soft-deleted might 
                        be brought in again later query, so the logic should be able to detect this and restore the record accordingly  */
                        const foundEntry = await jobposting.findOne({
                            paranoid: false,
                            where: { linkedin_job_url_cleaned: element.linkedin_job_url_cleaned }
                        })
                        // console.log("[Select result]: " + foundEntry)
                        if (foundEntry !== null) {
                            // sort out whether it is soft deleted or not 
                            if (foundEntry.deletedAt !== null) {
                                logger.info(`[processRequest] restore : ${JSON.stringify(foundEntry.linkedin_job_url_cleaned)} `);
                                await foundEntry.restore();
                            } else {
                                // update
                                logger.info(`[processRequest] Update : ${JSON.stringify(foundEntry.linkedin_job_url_cleaned)} `);
                            }
                            /************************ */
                            // Sequelize doesn't reflect the manual changes in updatedAt, deletedAt columns in input data set to Database records
                            // as if these columns should be treated as the system default values that user shouldn't touch
                            // in this regard, element.updatedAT = new Date() won't work but instead use changed()

                            // updating updatedAt manually with sequelize
                            // https://stackoverflow.com/questions/42519583/sequelize-updating-updatedat-manually
                            await foundEntry.changed('updatedAt', true)
                            await foundEntry.set(element);
                            await foundEntry.save();
    
    
                        } else {
                            logger.info(`[processRequest] insert : ${JSON.stringify(element.linkedin_job_url_cleaned)} `);
    
                            await jobposting.create(element);
                            // Logging.write("[insert]"+JSON.stringify(element.linkedin_job_url_cleaned)+"\n");    
                        }

                    }else
                    {
                        logger.warn(`[processRequest] filtering keywords founds in ${element.job_title} `);
                    }

                } else {
                    // res.write

                    logger.warn(`[processRequest] IncorrectDatafromAPI :  ${element.normalized_company_name} is not a seach keyword `);
                    // Logging.write("[error_from_API]"+element.normalized_company_name +" is not a search keyword\n")
                }
            })
            // In recursive manner, request next page from API end point
            // data props in queryOption is not JSON object.. it is string that "looks like" JSON
            if(!testmode){
                let nextSearchOption = JSON.parse(result.config.data);
                nextSearchOption.page = (parseInt(nextSearchOption.page) + 1).toString();
                queryOption.data = JSON.stringify(nextSearchOption);
            }

            /*Test purpose : don't probe into more pages but only single page */
            // return {
            //     "fetched" : result.config.data
            // }

            /* Production purpose return */
            return testmode? {"fetched": JSON.parse(queryOption.data)}:await processAPIRequestAndSQL(queryOption, companyName, loc);
        }
        else {
            // Before MaxPageToProbe was set, the below served well as alll the result JSON object coming from RapidAPI
            // But now we have to make our own 
            // Logging.write("[no data]\n")
            // return {
            //     "fetched" : result.config.data
            // }
            return {
                "fetched": JSON.parse(queryOption.data)
            };

        }
        //  put validation here. don't allow null or soemthing differet from company NAme
        // also for better analysis, put log into the file
        //   jobposting.create(result.data[1]);
        //   jobposting.bulkCreate(result.data);
        // From Linked in to our backend server, we got object as a response, not string

    } catch (error) {
        logger.error(`[processRequest] error : ${error}`);
        // To see the full structure of the error by invoking pullJobPostings() directly in worker.js
        // : JSON structure => response.data.message
        // console.log(error)

        return {
            "fetched": error
        };
    }
}



module.exports = { pullJobPostings, processAPIRequestAndSQL };

// test with debugger <= this depends on which testing data is imported right at the top of processAPIRequestAndSQL
// However, this test shouldn't be done with production DB since this module will insert the entries for mocking test
// processAPIRequestAndSQL('', '', '',true);

//test with debugger 2
// (async() => {
//     await pullJobPostings();
// })();