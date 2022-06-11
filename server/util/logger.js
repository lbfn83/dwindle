const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs')
const {uploadFile}= require('./googleDrive')


const logFormat = winston.format.combine(
    // below colorize cause escape charaters getting in the string
    // https://stackoverflow.com/questions/37194413/winston-file-transport-logs-escape-characters
    //  winston.format.colorize(),
    
 winston.format.timestamp({format: "MMM-DD-YYYY HH:mm:ss"}),
 winston.format.align(),
 winston.format.printf(
  (info) => `${info.level} : ${info.timestamp} : ${info.message}`,
),);

const transport = new DailyRotateFile({
    // frequency: '24h',
    frequency : '1h',

    // if you want to rotate files every five minutes... gotta change 
    // file name pattern as well

    filename: 'dwindle-%DATE%.log',

    //datePattern : 'YYYY-MM-DD',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
    prepend: true,
    level: 'info',

});

// Daily Rotate file is also file stream 
// so you can define specific listner with on
// in this case, in every 'rotate' we are doing something
// be careful it might be skipped when server is restarting around 
// the time of rotation
transport.on('rotate', async function (oldFilename, newFilename) {
// call function like upload to s3 or on cloud

    logger.log('info', `[Logger] rotating file from ${oldFilename} to ${newFilename}`)
  
    // google is also finicky :  Error: invalid_grant
    await uploadFile(oldFilename, logger)
  
    // https://unix.stackexchange.com/questions/151951/what-is-the-difference-between-rm-and-unlink
    // rm is too clever, so we need to use safer alternative which is unlink
    fs.unlinkSync(oldFilename)
});

//change the level later 
// transport.level = 'error'

const logger = winston.createLogger({
    format: logFormat,
    transports: [
        transport,
        new winston.transports.Console({
            level: 'info'}),
]});

module.exports = logger;