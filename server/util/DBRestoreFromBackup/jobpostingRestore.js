const fs = require("fs");
const {parse}= require('csv');
const {jobposting} = require('../../models')
const path = require('path')

/* This function is almost as identical as comapnyRestore.js 
please find the comment there for details*/
async function jobpostingRecordsRestoreFromCSV(filename)
{   
    
    const dbObjArray = []
    let cnt = 0
    let columns

    await fs.createReadStream(path.join(__dirname, '/CSVBackup/', filename))
    // .pipe(replaceStream(regex))
    .pipe(parse({delimiter:","}))
    .on("data",function(row){
        // console.log(String(row))
        cnt ++;
        if(cnt === 1)
        {
            columns = row
            return;
        }
        row.length
        let dbObj = {}
      
        row.forEach((element, idx)  => {
            
            if(idx < row.length - 3 )
            {
                const trimmedelement = String(element).trim()
                dbObj[columns[idx]] = element
            }
            if( idx === row.length-1 )
            {   
                if(element != "NULL" )
                {
                    dbObj[columns[idx]] = Date(element)
                }
                
            }
        });
        console.log(cnt, JSON.stringify(dbObj))   
        dbObjArray.push(dbObj)
        
    })
    .on("end", async() => {
        console.log("Total elements" + JSON.stringify(dbObjArray))
        await jobposting.bulkCreate(dbObjArray, {
            // the below is only specific to company table hmmm
                updateOnDuplicate: ['linkedin_job_url_cleaned']
        }).then((rtn) => console.log("[JobPosting Records Retore] Done : ", rtn))
         
    }).on("error", (err) => console.log("[JobPosting Records Retore] error : " + err.message)) 
}

module.exports = {
    jobpostingRecordsRestoreFromCSV
}