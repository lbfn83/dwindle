// https://stackoverflow.com/questions/11508463/javascript-set-object-key-by-variable

//  If you want to run this script independently, 
// .env file should be located in the same folder as it is how sequelize organize its connection information. 

const fs = require("fs");
const {parse}= require('csv');

const path = require('path')

/*
    Queries generated from bulkInsert in sequelize are different : "updatedAt" is not considered
    ex) 
    benefit table :
        ON CONFLICT ("company_name","benefit_type") DO UPDATE SET "company_name"=EXCLUDED."company_name","benefit_type"=EXCLUDED."benefit_type","benefit_details"=EXCLUDED."benefit_details","link_to_benefit_details"=EXCLUDED."link_to_benefit_details" 
        RETURNING "uuid","company_name","benefit_type","benefit_details","link_to_benefit_details","createdAt","updatedAt","deletedAt"
    company table :
        ON CONFLICT ("company_name") DO UPDATE SET "company_name"=EXCLUDED."company_name","company_jobpage"=EXCLUDED."company_jobpage","company_website"=EXCLUDED."company_website","industry"=EXCLUDED."industry","imagelink"=EXCLUDED."imagelink","company_summary"=EXCLUDED."company_summary","company_description"=EXCLUDED."company_description","job_scraper"=EXCLUDED."job_scraper","updatedAt"=EXCLUDED."updatedAt","deletedAt"=EXCLUDED."deletedAt" 
        RETURNING "uuid","company_name","company_jobpage","company_website","industry","imagelink","company_summary","company_description","job_scraper","createdAt","updatedAt","deletedAt";
*/


/**
 * Seed the benefit table with the records retrieved from the specified CSV file
 * TODO : Unlike other tables restore procedure, bulk insert doesn't update its updateAt timestamp
 * I suspect Sequelize bulk upsert on composite primary key might generate different query
 * refer to the above
 * 
 * @param {String} filename the name of CSV file containing records
 * @param {Sequelize} benefit sequelize model object /it is required to prevent circular dependency from classmethod in model
 * @param {logger} winston logger object
 */

async function benefitRecordsRestoreFromCSV(filename, benefit, logger)
{   
    try{
        logger.info(`[benefitRecordsRestoreFromCSV]benefit Records Retore started! `);
        const dbObjArray = [];
        let cnt = 0;
        let columns;
        
        // In parse() function, 
        // "Aetna, A CVS Company" is actually recognized as a whole, not parsed at all.. nice
        // Don't need to worry replace "," into something else like semi colon
        // to differtiate them against ","" inside double quotes 
        fs.createReadStream(path.join(__dirname, '/CSVBackup/', filename))
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
                columns = row;
                return;
            }
            let dbObj = {};
            row.forEach((element, idx)  => {
                
                // deletedAt : if this item was soft deleted before then 
                // import current timestamp into this column, otherwise skip it
                if(columns[idx]==='deletedAt')
                {
                    if(element != "NULL" && element != '' )
                    {
                        dbObj[columns[idx]] = Date(element);
                    }
                }
                // createdAt, updatedAt columns shouldn't be specified here
                // they are automatically generated from Sequelize   
                else if(columns[idx]!=='createdAt' && columns[idx]!=='updatedAt' )
                {
                    const trimmedelement = String(element).trim();
                    dbObj[columns[idx]] = trimmedelement;
    
                }
    
    
            });
            logger.debug(`[benefitRecordsRestoreFromCSV] each row info parsed from csv file : row(${cnt}) => ${JSON.stringify(dbObj)}`);   
            dbObjArray.push(dbObj);
            
    
        })
        .on("end", async() => {
            // console.log("Total elements" + JSON.stringify(dbObjArray))
            await benefit.bulkCreate(dbObjArray, {
                // Fields to update if row key already exists
                // https://sequelize.org/v5/class/lib/model.js~model
                updateOnDuplicate: columns
                    // updateOnDuplicate: ['company_name', 'benefit_type']
            }).then(async(rtn) => {
                logger.debug(`[benefitRecordsRestoreFromCSV] benefit Records Retore Done : ${JSON.stringify(await rtn)}`);
                logger.info(`[benefitRecordsRestoreFromCSV] finished!`);
            }).catch(async(error)=> {
                logger.error(`[benefitRecordsRestoreFromCSV] error : ${error}`);
            });
             
        }).on("error", (err) => logger.error(`[benefitRecordsRestoreFromCSV] error1 : ${err.message}`));
    }catch(e)
    {
        logger.error(`[benefitRecordsRestoreFromCSV] error2 : ${e}`);
    }

 
}

// benefitRecordsRestoreFromCSV('benefit table_0629.csv')

module.exports = {
    benefitRecordsRestoreFromCSV
}

/* DB restore prac */
// const tablename = 'company'
// const backupLoc = path.join(__dirname, filename)
// importFromCSV(tablename, backupLoc)
// comapnyRecordsRestoreFromCSV('company',filename)
