const express = require('express');
const fs = require("fs");
const axios = require('axios');
const db = require('../models')
const company = db.company
const jobposting = db.jobposting

// TODO: this should be a function without returning response object
 async function jobPostingQueryOptionBuilder() 
{
    try{
        const dateLib  = new Date()
        const dateStr = (dateLib.toDateString(Date.now())+" "+dateLib.getHours()).replace(/\s/g, '_')
        fs.promises.mkdir('./Log', { recursive: true }).catch(console.error);
        var Logging = fs.createWriteStream(`./Log/logging${dateStr}.txt`, {
        flags: 'a' // 'a' means appending (old data will be preserved)
        })
        const companyDBentries = await company.findAll()//.then((entries ) => {console.log("[Company DB entri]",entries)})
        const companyList = companyDBentries.map((element) => element.companyname )
        const location = ['USA', 'CANADA']
        Logging.write("<<<<<<<<"+ dateStr +">>>>>>>>>>")
        Logging.write("\n------Company List---------\n")
        
        companyList.forEach((each) => {
            Logging.write(each+'\n')
        }) 
        Logging.write("\n------------------------\n")
        
        let combinedList = []
        
        location.forEach( (loc) =>{
            let result = companyList.map((comName) => {
                    return {
                        "company" : comName,
                        "location" : loc 
                    }
            })
            combinedList = [...combinedList, ...result]
        })

        let results = []

        async function setupQueryOption(item, cb) {
            var queryOption = {
                method: 'POST',
                url: 'https://linkedin-jobs-search.p.rapidapi.com/',
                headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
                'X-RapidAPI-Key': `${process.env.API_KEY}`
                },  
            
                data: `{"search_terms":"${item.company}","location":"${item.location}","page":"1","fetch_full_text": "yes"}`
            };  
            await processAPIRequestAndSQL( queryOption , item.company, item.location, Logging).then((rtn) => {
                // res.write(JSON.stringify(rtn)+"/n")
                results.push(rtn)
                cb();
            })
        }
        // Promisify
        const promisePoolSearchKeywords = combinedList.map((item) => {
            // console.log("[item]",  item)
            return new Promise((resolve) => {
                setupQueryOption(item, resolve);
            });
        })
        // let rtnResult = undefined
        await Promise.all(promisePoolSearchKeywords).then( () => {
            // The return value of Promise.all is "," which is odd
            
            // results.push({"fetched" : " done "})
            
            results.forEach((elem)=> {
                Logging.write("[jobpostingfetcher result] : \n")
                Logging.write(JSON.stringify(elem) + '\n')
            })
            console.log("[jobpostingfetcher task complete]")
            // Async Await ... complex concept ... forgot to put return in outer loop 
            // also forgot to put await in Promise.all
            // which caused malfunction of this function  
            // that was not returning promise( return value )  
            
            // rtnResult = new Promise((resolve) => resolve(results))
            
        }); 
        
        return results//rtnResult
    }
    catch(err)
    {
        console.log("[jobpostingfetcher error] : "+ err)
        Logging.write("[jobpostingfetcher error] : "+ err + "\n")
        return { "error" : err}
    }

}

async function processAPIRequestAndSQL( queryOption, companyName, loc, Logging)
{
    try
    {    
  
        Logging.write("\n------API response---------\n")
        Logging.write("\n---queryOption : " + queryOption.data + "----\n")
        
        const result = await axios.request(queryOption)
        
        Logging.write("[rowData] : " + JSON.stringify(result.data.length) + "[rowData End]\n")  

        if(  result.data !== undefined && result.data.length > 0   )//|| result.data.length>0 )
        {
            result.data.forEach( async (element) => {
                Logging.write("[eachElem] : " + JSON.stringify(element) + "\n")

                // If API sends wrong data having different company name, simply ignore 
                // Chegg INC from API.. our database Chegg
                // Natixis assurance from API ... our database Natxis
                if(element.company_name.includes(companyName) )
                {

                    element.normalized_job_location = loc
                    element.company_name = companyName
                    
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
                    
                    /* Insert new jobposting item or Update existing DB entry corresponding to jobposting item*/
                    const foundEntry = await jobposting.findOne({where : {
                        linkedin_job_url_cleaned: element.linkedin_job_url_cleaned 
                    }})
                    // console.log("[Select result]: " + foundEntry)
                    if(foundEntry !== null)
                    {
                        // update
                        foundEntry.set(element)
                        Logging.write("[update] : " + JSON.stringify(foundEntry.linkedin_job_url_cleaned)+"\n")
                        await foundEntry.save()
                    
                    }else{
                        await jobposting.create(element)    
                        Logging.write("[insert]"+JSON.stringify(element.linkedin_job_url_cleaned)+"\n");    
                    }

                }else
                {
                    // res.write
                    Logging.write("[error_from_API]"+element.normalized_company_name +" is not a search keyword\n")
                }
            })
            // In recursive manner, request next page from API end point
            // data props in queryOption is not JSON object.. it is string that "looks like" JSON

            let nextSearchOption = JSON.parse(result.config.data) 
            nextSearchOption.page = (parseInt(nextSearchOption.page)+1).toString()
            queryOption.data = JSON.stringify(nextSearchOption)
            
            /*Test purpose : don't probe into more pages but only single page */ 
            // return {
            //     "fetched" : result.config.data
            // }
            
            /* Production purpose return */
            return await processAPIRequestAndSQL( queryOption , companyName, loc, Logging)
        }
        else
        {
            Logging.write("[no data]\n")
            return {
                "fetched" : result.config.data
            }
        }   
            //  put validation here. don't allow null or soemthing differet from company NAme
            // also for better analysis, put log into the file
            //   jobposting.create(result.data[1]);
            //   jobposting.bulkCreate(result.data);
            // From Linked in to our backend server, we got object as a response, not string

    }catch(error)
    {
        
        Logging.write("[error] : "+ error+ "\n")
    }
}

module.exports = { jobPostingQueryOptionBuilder}