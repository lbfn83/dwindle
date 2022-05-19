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

router.get('/setupCompanyListFromTxt/:uuid', async (req, res) => {
    // how to use uuid and req.params 
    const uuid = req.params.uuid
    console.log('[testRouter] request: ',uuid)
    try{
        const data = []
        const fileContent = fs.readFileSync('./data/company_list.txt', 'utf-8');
        fileContent.split(/\r?\n/).forEach(line =>  {
            if(line != "")
            {
                const trimedWord  = line.trim();
                data.push(trimedWord)
                // console.log(`[testRouter] Line from file: ${trimedWord}`);
            }
          });

        const dbEntries = data.map( elem => {
            return {"companyname": elem};
        })

        // console.log(dbEntries)
        // What is bulkCreate's return? some sequelize auto created field with dbEntries
        await company.bulkCreate(dbEntries);
        // console.log(`[testRouter] bulkInsert result : `, result);
        return res.status(200).json(dbEntries);
    }catch(error)
    {
        // console.log(`[testRouter] Err : `, error);
        // 500 Internal Server Error
        // 400 Bad Request
        return res.status(500).json({message : error})
    }
});




router.get('/fetchJOBpostingData', async (req, res) => {
        var Logging = fs.createWriteStream('./QueryResult/logging.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
      })
        const companyDBentries = await company.findAll()//.then((entries ) => {console.log("[Company DB entri]",entries)})
        const companyList = companyDBentries.map((element) => element.companyname )
        const date  = new Date()
        const location = ['USA', 'CANADA']
        Logging.write("<<<<<<<<"+ date.toDateString(Date.now())+" "+date.getHours() +">>>>>>>>>>")
        Logging.write("\n------Company List---------\n")
        
        companyList.forEach((each) => {
            Logging.write(each+'\n')
    
        }) 

        let idx = 0
        let dataProcess = await companyList.forEach( async (companyName) => {
            
             await location.forEach( async (loc) => {

                    var queryOption = {
                        method: 'POST',
                        url: 'https://linkedin-jobs-search.p.rapidapi.com/',
                        headers: {
                        'content-type': 'application/json',
                        'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
                        'X-RapidAPI-Key': `${process.env.API_KEY}`
                        },  
                    
                        data: `{"search_terms":"${companyName}","location":"${loc}","page":"1","fetch_full_text": "yes"}`
                    };  

                    try
                    {   
                        const result = await axios.request(queryOption)
                        
                        Logging.write("\n------API response---------\n")
                        Logging.write("\n---queryOption : " + queryOption.data + "----\n")

                        idx += 1
                        Logging.write("[res "+idx+" ] :" + companyName+"\n")
                        Logging.write("[rowData] : " + JSON.stringify(result.data.length) + "[rowData End]\n")  

                        if( result.data !== undefined && result.data.length > 0   )//|| result.data.length>0 )
                        {
                            result.data.forEach( async (element) => {
                                Logging.write("[eachElem] : " + JSON.stringify(element) + "\n")

                                // If API sends wrong data having different company name, simply ignore 
                                // Chegg INC from API.. our database Chegg
                                // Natixis assurance from API ... our database Natxis
                                if(element.company_name.includes(companyName) )
                                {
                                    // TODO : see if same data entry already exists in database and 
                                    // if so, doing updateValidation
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
                                    
                                    const foundEntry = await jobposting.findOne({where : {
                                        linkedin_job_url_cleaned: element.linkedin_job_url_cleaned 
                                    }})
                                    console.log("debugging is hard : " + foundEntry)
                                    if(foundEntry !== null)
                                    {
                                        
                                        // update
                                       foundEntry.set(element)
                                       Logging.write("[update] : " + JSON.stringify(foundEntry))
                                       await foundEntry.save()
                                       Logging.write("[/update]\n");
                                    }else{
                                        await jobposting.create(element)    
                                        Logging.write("[insert]\n");    
                                    }
                                   
                                }else
                                {
                                    // res.write
                                    Logging.write("[error_from_API]"+element.normalized_company_name +" is not a search keyword\n")
                                }
                            })
                        }else{

                            Logging.write("[no data]\n")
                        }   
                            //   put validation here. don't allow null or soemthing differet from company NAme
                            // also for better analysis, put log into the file
                            //   jobposting.create(result.data[1]);
                            //   jobposting.bulkCreate(result.data);
                            // From Linked in to our backend server, we got object as a response, not string
            
                        }catch(error)
                        {
                            Logging.write("[error] : "+ error+ "\n")
                        }
                    })
            
            //   console.log("result Data in server: ", result)
            //   await res.send(result.data)  
        })

       
            // Logging.write("[end] ");
            // Logging.end();
        //TODO: why should this be asynchronous or otherwise it returns response way too fast 
        async () => {res.send("good job")};  
         
        // return res.json(companyList)
    //   res.status(400).send('Error while getting list of jobs.Try again later.');

    })

module.exports = router