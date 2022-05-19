// TODO: this should be a function without returning response object
async (req, res) => {
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
    // TODO : await and async is really needed in here?
    await companyList.forEach( async (companyName) => {
        
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
                
                    await processAPIRequestAndSQL( queryOption , companyName, loc, Logging).then((rtn) => {res.write(rtn)})
                    
                

            })
        
        //   console.log("result Data in server: ", result)
        //   await res.send(result.data)  
    })

   
        // Logging.write("[end] ");
        // Logging.end();
    //TODO: why should this be asynchronous or otherwise it returns response way too fast 
    res.end()  
     
    // return res.json(companyList)
//   res.status(400).send('Error while getting list of jobs.Try again later.');

})


async function processAPIRequestAndSQL( queryOption , companyName, loc, Logging)
{
try
{    
  
    const result = await axios.request(queryOption)
    
    Logging.write("\n------API response---------\n")
    Logging.write("\n---queryOption : " + queryOption.data + "----\n")

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
                
                /* Insert new jobposting item or Update existing DB entry corresponding to jobposting item*/
                const foundEntry = await jobposting.findOne({where : {
                    linkedin_job_url_cleaned: element.linkedin_job_url_cleaned 
                }})
                console.log("[Select result]: " + foundEntry)
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

        processAPIRequestAndSQL( queryOption , companyName, loc, Logging)
    }
    else
    {
        Logging.write("[no data]\n")
        return {
            "company" :  companyName,
            "total page" : result.config.data
        }
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
}