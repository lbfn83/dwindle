const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const {uploadFile}= require('./googleDrive');
require('dotenv').config();

const { NODE_ENV } = process.env;

const logFormat = winston.format.combine(
    // below colorize cause escape charaters getting in the string
    // https://stackoverflow.com/questions/37194413/winston-file-transport-logs-escape-characters
    //  winston.format.colorize(),
    
 winston.format.timestamp({format: "MMM-DD-YYYY HH:mm:ss"}),
 winston.format.align(),
 winston.format.printf(
  (info) => `${info.level} : ${info.timestamp} : ${info.message}`,
),);
// const transport = new DailyRotateFile({
//             frequency : '1m',
        
//             // if you want to rotate files every five minutes... gotta change 
//             // file name pattern as well
        
//             filename: 'dwindle-test-%DATE%.log',
        
//             // datePattern : 'YYYY-MM-DD-HH-mm',
//             datePattern : 'YYYY-MM-DD-HH-mm',
//             zippedArchive: false,
//             maxSize: '20m',
//             maxFiles: '14d',
//             prepend: true,
//             level: 'info',
        
//         });
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
/* what is the problem in below codes? winston doesn't run at all*/
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
                level: 'info',
            
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
                level: 'info',
            
            });
        }
    }catch(err)
    {
        console.log(` what the heck error ":${err}`)
    }
})();


// const transport = new DailyRotateFile({
//     frequency: '24h',
//     // frequency : '1h',

//     // if you want to rotate files every five minutes... gotta change 
//     // file name pattern as well

//     filename: 'dwindle-%DATE%.log',

//     datePattern : 'YYYY-MM-DD',
//     // datePattern: 'YYYY-MM-DD-HH',
//     zippedArchive: false,
//     maxSize: '20m',
//     maxFiles: '14d',
//     prepend: true,
//     level: 'info',

// });

// Daily Rotate file is also file stream 
// so you can define specific listner with on
// in this case, in every 'rotate' we are doing something
// be careful it might be skipped when server is restarting around 
// the time of rotation
transport.on('rotate', async function (oldFilename, newFilename) {
// call function like upload to s3 or on cloud

    logger.log('info', `[Logger] rotating file from ${oldFilename} to ${newFilename}`)
  
    // google is also finicky :  Error: invalid_grant
    await uploadFile(oldFilename)
  
    // https://unix.stackexchange.com/questions/151951/what-is-the-difference-between-rm-and-unlink
    // rm is too clever, so we need to use safer alternative which is unlink
    fs.unlinkSync(oldFilename)
});
transport.on('new', async function ( newFilename) {
    logger.log('info', `[Logger] START A NEW LOGGING : ${newFilename}`);
  
});
// transport.on('logRemoved', async function ( removedFilename) {
//     logger.log('info', `[Logger] FILE REMOVED  : ${removedFilename}`);
  
// });
//change the level later 
// transport.level = 'error'

const logger = winston.createLogger({
    format: logFormat,
    transports: [
        transport,
        new winston.transports.Console({
            level: 'info'}),
]});

module.exports = {logger};