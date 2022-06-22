
const { execSync } = require('child_process');
const {dbDumpScheduler} = require('../../config/bullConfig')
const compress = require('gzipme');
const fs = require('fs')
const db = require('../../models/')
const {logger} = require('../../config/logger')
const {uploadFile}= require('../../config/googleDrive')
require('dotenv').config();
// Below information is obsolete

// const dotenv = require('dotenv');
// dotenv.config();
// const username = process.env.PROD_DB_USERNAME;
// const password =  process.env.PROD_DB_PASSWORD;
// const host = process.env.PROD_DB_HOST;
// const database = process.env.PROD_DB_NAME;

const username = db.sequelize.config.username;
const password =  db.sequelize.config.password;
const host = db.sequelize.config.host;
const database = db.sequelize.config.database;

const { NODE_ENV } = process.env;


logger.info(`[Bull DBDumpScheduler] NODE_ENV ${NODE_ENV} `)
const cronOpt = (() => {
    if(NODE_ENV === 'test' || NODE_ENV === 'development')
    {
        return { cron : '*/2 * * * *'};
    }
    else{
        return { cron : '12 17 * * *'};
    }
})();


async function registerDBDumpScheduler()
{
    logger.info(`[Bull DBDumpScheduler] registered! `)
    await dbDumpScheduler.obliterate({force : true})
    dbDumpScheduler.add({ message : 'db dump finished!' } , {repeat: cronOpt})
}

dbDumpScheduler.process( async(job) => {
    logger.info(`[Bull DBDumpScheduler] Consumer Started!`)

    // logger.info(`[Bull DBDumpScheduler] Consumer: job info in consumer: ${JSON.stringify(job.data)}`)
    psqlDump()
})

dbDumpScheduler.on('completed', function (job) {
    // A job successfully completed with a `result`.
    logger.debug(`[Bull DBDumpScheduler] Event listner : completed  : ${JSON.stringify(job)}`)
    
    logger.info(`[Bull DBDumpScheduler] Event listner: completed : ${JSON.stringify(job.data.message)}`)
})

async function psqlDump() {
    const date = new Date();
    const currentDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
    const fileName = `database-backup-${currentDate}.tar`;
    // `pg_dump -U ${username} -d ${database} -f ${fileName} -F t`
    // https://www.codegrepper.com/code-examples/javascript/run+command+line+command+from+javascript
    // const output = await execSync("dir",{ encoding: 'utf-8' })
    
    try{
        const output = execSync(`pg_dump -f ${fileName} -F t postgres://${username}:${password}@${host}:5432/${database} `, { encoding: 'utf-8' })
        logger.info(`[Bull DBDumpScheduler] psqlDump db dump done `)
        // compress and uploadFile doesn't return anything
        await compress(fileName).then(async () => {
            
            logger.info(`[Bull DBDumpScheduler] psqlDump compress and upload : ${fileName}`)
            compressedFileName = fileName + ".gz"
            await uploadFile(compressedFileName, logger).then((msg)=> {
                logger.error(`[Bull DBDumpScheduler] Google upload finished : ${msg}`)
                fs.unlinkSync(compressedFileName);
            }).catch((error)=>{
                logger.error(`[Bull DBDumpScheduler] Google upload error : ${error}`)
            })
    
        }).then(()=> {
            fs.unlinkSync(fileName);
        });
    }catch(error)
    {
        logger.error(`[Bull DBDumpScheduler] psqlDump error : ${error}`)
    }

}
module.exports = {registerDBDumpScheduler}


/* when it comes to pg_restore

command : pg_restore  -d [connection string] [archive file or directory where toc file is]

if any dump file was originally from another database with different name and user, 

change toc.dat file's string to have right database information 

*/
