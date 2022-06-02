// https://stackoverflow.com/questions/11508463/javascript-set-object-key-by-variable

const fs = require("fs");
const {parse}= require('csv');
const {company} = require('../../models')
const path = require('path')
async function comapnyRecordsRestoreFromCSV(filename)
{   
    const dbObjArray = []
    let cnt = 0
    let columns
    
    // In parse() function, 
    // "Aetna, A CVS Company" is actually recognized as a whole, not parsed at all.. nice
    // Don't need to worry replace "," into something else like semi colon
    // to differtiate them against ","" inside double quotes 
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
            
            // createdAt, updatedAt columns shouldn't be specified here
            // they are automatically generated from Sequelize 
            if(idx < row.length - 3 )
            {
                const trimmedelement = String(element).trim()
                dbObj[columns[idx]] = element
            }
            // deletedAt : if this item was soft deleted before then 
            // import current timestamp into this column
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
        await company.bulkCreate(dbObjArray, {
            // the below is only specific to company table hmmm
                updateOnDuplicate: ['companyname']
        }).then((rtn) => console.log("[Company Records Retore] Done : ", rtn))
         
    }).on("error", (err) => console.log("[Company Records Retore] error : " + err.message)) 

    // .pipe(parse({delimiter:";", from_line : 1 })) // ,
        
    // bulkInsert updateOnDuplicate: ['companyname']
}

module.exports = {
    comapnyRecordsRestoreFromCSV
}