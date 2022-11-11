const axios = require('axios');
const { json } = require('body-parser');
const express = require('express');
const router = express.Router();
const fs = require("fs");
require('dotenv').config()

// Sequelize. db contains all the models defined
const db = require('../models')
const company = db.company
const jobposting = db.jobposting


router.get('/sendVSjson', async (req, res) => {
    // res.json({hello: 'world'})
    // res.send({hello: 'world'})
    // res.send(undefined)
    // res.json(undefined)
    //  when null is passed there is difference in send and json
    // res.json(null)
    res.send(null)
})

// https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
router.get('/resWriteTest', async (req, res) => {
    
    function iterateArry(resolve, reject)
    {
        let counter = 0
        const a = [1,2,3,4]
        console.log('length : ' +a.length)
        a.forEach(async (elem) => {
            await setTimeout(()=> {
                console.log('Hello world');
                res.write('asdf', 'utf8')
            }, 3000)
            counter++;
            if(counter === a.length)
            {
                console.log("done")
                resolve("done")
            }
        })


    }
    
    const promise = new Promise(iterateArry);
    promise.then( ()=> {
        console.log("end")
        
        res.end('ok')})
    
})

router.get('/resWriteTest2', async (req, res) => {
    
    function asyncFunction (item, cb) {
        setTimeout(() => {
          console.log('done with', item);
          res.write('asdf', 'utf8')
          cb();
        }, 3000);
    }

    let requests = [1,2,3,4 ].map((item) => {
        return new Promise((resolve) => {
          asyncFunction(item, resolve);
        });
    })
    
    Promise.all(requests).then(() => res.end('ok'));
})





const {toHttp} = require('../util/toHttp')

const {jobPostingQueryOptionBuilder} = require('../controllers/jobPostingFetcher')

router.get('/fetchJOBpostingData', toHttp(jobPostingQueryOptionBuilder))


// async (req, res) => {
//         const dateLib  = new Date()
//         const dateStr = (dateLib.toDateString(Date.now())+" "+dateLib.getHours()).replace(/\s/g, '_')
//         fs.promises.mkdir('./Log', { recursive: true }).catch(console.error);
//         var Logging = fs.createWriteStream(`./Log/logging${dateStr}.txt`, {
//             flags: 'a' // 'a' means appending (old data will be preserved)
//         })
//         const companyDBentries = await company.findAll()//.then((entries ) => {console.log("[Company DB entri]",entries)})
//         const companyList = companyDBentries.map((element) => element.companyname )
//         const location = ['USA', 'CANADA']
//         Logging.write("<<<<<<<<"+ dateStr +">>>>>>>>>>")
//         Logging.write("\n------Company List---------\n")
        
//         companyList.forEach((each) => {
//             Logging.write(each+'\n')
//         }) 
//         Logging.write("\n------------------------\n")


//         let combinedList = []
//         location.forEach( (loc) =>{
//             let result = companyList.map((comName) => {
//                     return {
//                         "company" : comName,
//                         "location" : loc 
//                     }
//             })
//             combinedList = [...combinedList, ...result]
//         })

//         async function setupQueryOption(item, cb) {
//             var queryOption = {
//                 method: 'POST',
//                 url: 'https://linkedin-jobs-search.p.rapidapi.com/',
//                 headers: {
//                 'content-type': 'application/json',
//                 'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
//                 'X-RapidAPI-Key': `${process.env.API_KEY}`
//                 },  
            
//                 data: `{"search_terms":"${item.company}","location":"${item.location}","page":"1","fetch_full_text": "yes"}`
//             };  
//             await processAPIRequestAndSQL( queryOption , item.company, item.location, Logging).then((rtn) => {
//                 console.log("rtn ;::", rtn)
//                 // if(rtn !== undefined)
//                     res.write(JSON.stringify(rtn)+"/n")
//                 cb();
//             })
//         }
    
//         const promisePoolSearchKeywords = combinedList.map((item) => {
//             // console.log("[item]",  item)
//             return new Promise((resolve) => {
//                 setupQueryOption(item, resolve);
//             });
//         })
     
//         Promise.all(promisePoolSearchKeywords).then(() => {
//             res.end("\n done \n")
//         });
   
//     })


// async function processAPIRequestAndSQL( queryOption , companyName, loc, Logging)
// {
//     try
//     {    
      
//         const result = await axios.request(queryOption)
        
//         Logging.write("\n------API response---------\n")
//         Logging.write("\n---queryOption : " + queryOption.data + "----\n")

//         Logging.write("[rowData] : " + JSON.stringify(result.data.length) + "[rowData End]\n")  

//         if( result.data !== undefined && result.data.length > 0   )//|| result.data.length>0 )
//         {
//             result.data.forEach( async (element) => {
//                 Logging.write("[eachElem] : " + JSON.stringify(element) + "\n")

//                 // If API sends wrong data having different company name, simply ignore 
//                 // Chegg INC from API.. our database Chegg
//                 // Natixis assurance from API ... our database Natxis
//                 if(element.company_name.includes(companyName) )
//                 {
//                     // TODO : see if same data entry already exists in database and 
//                     // if so, doing updateValidation
//                     element.normalized_job_location = loc
//                     element.company_name = companyName
                    
//                     /* The problem with below is that it doens't update the found data entry 
                    
//                     Motivation : 
//                     on daily basis, jobposting database should be updated with new or existing jobposting data pulled from API query
//                     if existing data entry matches any of this new stream of data from API query, we simply 
//                     update UpdatedAt column as current timestamp so it is not the target of soft-deletion*/
//                     /*
//                     const [elemFound, created] = await jobposting.findOrCreate({
//                         where: { linkedin_job_url_cleaned: element.linkedin_job_url_cleaned },
//                         defaults: element
//                       });
//                       // when created is false, it is just updated
//                       Logging.write("Created? : "+ created + "//" + elemFound +"\n")
//                     */
                    
//                     /* Insert new jobposting item or Update existing DB entry corresponding to jobposting item*/
//                     const foundEntry = await jobposting.findOne({where : {
//                         linkedin_job_url_cleaned: element.linkedin_job_url_cleaned 
//                     }})
//                     console.log("[Select result]: " + foundEntry)
//                     if(foundEntry !== null)
//                     {
                        
//                         // update
//                        foundEntry.set(element)
//                        Logging.write("[update] : " + JSON.stringify(foundEntry.linkedin_job_url_cleaned)+"\n")
//                        await foundEntry.save()
                       
//                     }else{
//                         await jobposting.create(element)    
//                         Logging.write("[insert]"+JSON.stringify(element.linkedin_job_url_cleaned)+"\n");    
//                     }

//                 }else
//                 {
//                     // res.write
//                     Logging.write("[error_from_API]"+element.normalized_company_name +" is not a search keyword\n")
//                 }
//             })
//             // In recursive manner, request next page from API end point

//             // data props in queryOption is not JSON object.. it is string that "looks like" JSON
//             let nextSearchOption = JSON.parse(result.config.data) 
//             nextSearchOption.page = (parseInt(nextSearchOption.page)+1).toString()
//             queryOption.data = JSON.stringify(nextSearchOption)

//             return await processAPIRequestAndSQL( queryOption , companyName, loc, Logging)
          
//         }
//         else
//         {
//             Logging.write("[no data]\n")
//             return  {
//                 "searched" : result.config.data
//             }
//         }   
//             //   put validation here. don't allow null or soemthing differet from company NAme
//             // also for better analysis, put log into the file
//             //   jobposting.create(result.data[1]);
//             //   jobposting.bulkCreate(result.data);
//             // From Linked in to our backend server, we got object as a response, not string

//     }catch(error)
//     {
        
//         Logging.write("[error] : "+ error+ "\n")
//     }
// }


module.exports = router