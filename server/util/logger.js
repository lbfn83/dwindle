const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs')
const {uploadFile}= require('./googleDrive')


const logFormat = winston.format.combine(
    // This colorize cause escape charaters getting in the string
//  winston.format.colorize(),
 winston.format.timestamp({format: "MMM-DD-YYYY HH:mm:ss"}),
 winston.format.align(),
 winston.format.printf(
  (info) => `${info.level} : ${info.timestamp} : ${info.message}`,
),);

// const filename = "myFirstLog.log"
// const backupLoc = path.join(__dirname, '../logs/', filename)

const transport = new DailyRotateFile({
    frequency : '1m',
    // if you want to rotate files every five minutes... gotta change 
    // file name pattern as well

    filename: 'dwindle-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH_mm',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
    prepend: true,
    level: 'info',
});

// Daily Rotate file is also file stream 
// so you can define specific listner with on
// in this case, in every 'rotate' we are doing something
transport.on('rotate', async function (oldFilename, newFilename) {
// call function like upload to s3 or on cloud
    console.log('[filename1] : ', oldFilename)
    console.log('[filename2] : ', newFilename)
    await uploadFile(oldFilename)
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