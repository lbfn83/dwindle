// https://stackoverflow.com/questions/11508463/javascript-set-object-key-by-variable

//  If you want to run this script independently, 
// .env file should be located in the same folder as it is how sequelize organize its connection information. 

const fs = require("fs");
const {parse}= require('csv');
// const {company} = require('../../models')
const path = require('path')
/**
 * Seed the company Record table with the records retrieved from the specified CSV file
 * 
 * @param {String} filename the name of CSV file containing records 
 * @param {Sequelize} company sequelize model object /it is required to prevent circular dependency from classmethod in model
 * @param {logger} logger winston logger object
 */

async function comapnyRecordsRestoreFromCSV(filename, company, logger)
{
    try {
        logger.info(`[comapnyRecordsRestoreFromCSV]company Records Retore started! `);
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
            // first row contains column information
            // but after finding out we can't use "COPY" command to production server with the write access
            // only way is using dumped file which doesn't contain column information
            if(cnt === 1)
            {
                columns = row
                return;
            }
    
            let dbObj = {}
            row.forEach((element, idx)  => {
                
                // deletedAt : if this item was soft deleted before then 
                // import current timestamp into this column, otherwise skip it
                if(columns[idx]==='deletedAt')
                {
                    if(element != "NULL" && element != '' )
                    {
                        dbObj[columns[idx]] = Date(element)
                    }
                }
                // createdAt, updatedAt columns shouldn't be specified here
                // they are automatically generated from Sequelize   
                else if(columns[idx]!=='createdAt' && columns[idx]!=='updatedAt' )
                {
                    const trimmedelement = String(element).trim()
                    dbObj[columns[idx]] = trimmedelement
    
                }
    
    
            });
            logger.debug(`[comapnyRecordsRestoreFromCSV] each row info parsed from csv file : row(${cnt}) => ${JSON.stringify(dbObj)}`);
           
            dbObjArray.push(dbObj)
        })
        .on("end", async() => {
            // console.log("Total elements" + JSON.stringify(dbObjArray))
            await company.bulkCreate(dbObjArray, {
                // Fields to update if row key already exists
                // https://sequelize.org/v5/class/lib/model.js~model
                updateOnDuplicate: columns
                    // updateOnDuplicate: ['company_name']
            }).then(async(rtn) =>{
                logger.debug(`[comapnyRecordsRestoreFromCSV] company Records Retore Done : ${JSON.stringify(await rtn)}`);
                logger.info(`[comapnyRecordsRestoreFromCSV] finished!`);
            })
            .catch(async(error)=> {
                logger.error(`[comapnyRecordsRestoreFromCSV] error : ${error}`);
            });
        }).on("error", (err) => logger.error(`[comapnyRecordsRestoreFromCSV] error1 : ${err.message}`)) 
    
        // .pipe(parse({delimiter:";", from_line : 1 })) // ,
            
        // bulkInsert updateOnDuplicate: ['companyname']
    }catch(e)
    {
        logger.error(`[comapnyRecordsRestoreFromCSV] error2 : ${e}`);
    }   
}

// comapnyRecordsRestoreFromCSV('company table_0629.csv')

module.exports = {
    comapnyRecordsRestoreFromCSV
}

/* DB restore prac */
// const tablename = 'company'
// const backupLoc = path.join(__dirname, filename)
// importFromCSV(tablename, backupLoc)
// comapnyRecordsRestoreFromCSV('company',filename)
