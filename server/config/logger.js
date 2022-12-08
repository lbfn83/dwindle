const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
// const path = require('path')
const fs = require('fs');
const {uploadFile}= require('./googleDrive');

require('dotenv').config();

const { NODE_ENV } = process.env;

const LEVEL = 'info'; //'info', 'debug'

const logFormat = winston.format.combine(

    winston.format.timestamp({format: "MMM-DD-YYYY HH:mm:ss"}),
    winston.format.align(),
    winston.format.printf(
        (info) => `${info.level} : ${info.timestamp} : ${info.message}`,),
    // the below colorize method causes escape charaters getting in the string
    // https://stackoverflow.com/questions/37194413/winston-file-transport-logs-escape-characters
    // winston.format.colorize(),

);

/***************** */
// let options
// if(NODE_ENV === 'test' || NODE_ENV === 'development')
// {
//     options = {
//         frequency : '1m',
    
//         // if you want to rotate files every five minutes... gotta change 
//         // file name pattern as well
    
//         filename: 'dwindle-test-%DATE%.log',
    
//         // datePattern : 'YYYY-MM-DD-HH-mm',
//         datePattern : 'YYYY-MM-DD-HH-mm',
//         zippedArchive: false,
//         maxSize: '20m',
//         maxFiles: '14d',
//         prepend: true,
//         level: 'info',
    
//     }
// }else{
//     options = {
//         frequency: '24h',
//         // frequency : '1h',
        
//         // if you want to rotate files every five minutes... gotta change 
//         // file name pattern as well
    
//         filename: 'dwindle-%DATE%.log',
    
//         datePattern : 'YYYY-MM-DD',
//         // datePattern: 'YYYY-MM-DD-HH',
//         zippedArchive: false,
//         maxSize: '20m',
//         maxFiles: '14d',
//         prepend: true,
//         level: 'info',
    
//     }
// }

// const transport = new DailyRotateFile(options)
/************************************** */

const transport = (() => {
    try{

        if(NODE_ENV === 'test' || NODE_ENV === 'development')
        {
            return new DailyRotateFile({
                frequency : '5m',
            
                // if you want to rotate files every five minutes... gotta change 
                // file name pattern as well
            
                filename: 'dwindle-test-%DATE%.log',
            
                // datePattern : 'YYYY-MM-DD-HH-mm',
                datePattern : 'YYYY-MM-DD-HH-mm',
                zippedArchive: false,
                maxSize: '20m',
                maxFiles: '14d',
                prepend: true,
                level: LEVEL,
            
            });
        }
        else{
            return new DailyRotateFile({
                frequency: '12h',
                // frequency : '1h',
                
                // if you want to rotate files every five minutes... gotta change 
                // file name pattern as well
            
                filename: 'dwindle-%DATE%.log',
            
                datePattern : 'YYYY-MM-DD-HH',
                // datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: false,
                maxSize: '20m',
                maxFiles: '14d',
                prepend: true,
                level: LEVEL,
            
            });
        }
    }catch(err)
    {
        logger.info(`[Logger] transport init error ":${err}`)
    }
})();
// In case of changing the log level later 
// transport.level = 'error' or 'debug'

// Daily Rotate file is also file stream 
// so you can define specific listner with on
// in this case, in every 'rotate' we are doing something
// be careful it might be skipped when server is restarting around 
// the time of rotation
transport.on('rotate', async function (oldFilename, newFilename) {
// call function like upload to s3 or on cloud
    try{
        logger.log('info', `[Logger] rotating file from ${oldFilename} to ${newFilename}`)
        
        // Renaming file by adding an extra timestamp string ( act as an unique identifier ) 
        // To tell apart multiple log files that are generated in one rotation period
        // which would have had the same file name without the identifier ,
        const date = new Date();
        
        if(NODE_ENV === 'test' || NODE_ENV === 'development')
        {
            const filenameTS = `.${date.getMinutes()}_${date.getSeconds()}`;
            const filenameUploaded = oldFilename.split(".")[0]+ filenameTS + ".log" 
            // logger.info(path.join(__dirname, '../', oldFilename))
            // logger.info(path.join(__dirname, '../', filenameUploaded))
            // fs.renameSync(path.join(__dirname, oldFilename), path.join(__dirname, filenameUploaded))
            fs.renameSync( oldFilename, filenameUploaded)
        
            // google is also finicky :  Error: invalid_grant
            // await uploadFile(filenameUploaded)
            
            // https://unix.stackexchange.com/questions/151951/what-is-the-difference-between-rm-and-unlink
            // rm is too clever, so we need to use safer alternative which is unlink
            // fs.unlinkSync(filenameUploaded)
        }
        else{
            const filenameTS = `.${date.getHours()}_${date.getMinutes()}`;
            const filenameUploaded = oldFilename.split(".")[0]+ filenameTS + ".log" 
            // fs.renameSync(path.join(__dirname, oldFilename), path.join(__dirname, filenameUploaded))
            fs.renameSync( oldFilename, filenameUploaded)
        
            await uploadFile(filenameUploaded)
            fs.unlinkSync(filenameUploaded)
        }
    }catch(err)
    {
        logger.error( `[Logger rotation event]err : ${err}`)
    }
});



/******************************************* */
// To be able to manually invoke 'rotate' signal, 
// the current log file name should be passed over as an argument
var logfileName = null


transport.on('new', async function ( newFilename) {
    logger.log('info', `[Logger: new] START A NEW LOGGING : ${newFilename}`);
    logfileName = newFilename;
});

function shutdown(signal)
{
    // when it comes to uncaughtException signal, it has second arguments to specfiy the narrowed down cause of error
    return  (err) => {
        logger.info(`[Logger : shutdown] Signal triggered : ${signal}`);
        if(err){
            logger.error(`[Logger : shutdown] Error =>  ${JSON.stringify(err.stack || err)}`);
           
        }
        
        // console.log(logger.transports[0].listeners('rotate'))
        // To register the handling function of the rotate event, 
        // make sure pointing to the correct element 
        //  of transports array ( in this case it is the first element / refer to CreateLogger )

        // third argument 'new file name' is not really valid since 
        // heroku will wipe out any generated file outside from its src code
        // this file generated with new file name will be soon gone
        logger.transports[0].emit('rotate', logfileName ,`${logfileName.split('.')[0]}.2nd.log`);
        setTimeout(() => {
            logger.info(`[Logger : shutdown] ...waiting 5s before exiting.`);
            process.exit(err ? 1 : 0);
        }, 5000);

  }
}

/**********************************/ 
// logRemoved Event doesn't seem to be invoked at all
// transport.on('logRemoved', async function ( removedFilename) {
//     logger.log('info', `[Logger] FILE REMOVED  : ${removedFilename}`);
  
// });


const logger = winston.createLogger({
    format: logFormat,
    transports: [
        transport,
        new winston.transports.Console({
            level: LEVEL}),
]});

module.exports = {logger, shutdown};