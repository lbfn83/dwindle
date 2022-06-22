const {registerJPProcess} = require('./util/taskScheduler/jobpostingFetchScheduler')
const {registerDBDumpScheduler} = require('./util/taskScheduler/dbDumpScheduler')
// const {registerEmailService} = require('./util/taskScheduler/emailScheduler')
const {logger} = require('./config/logger')
const path = require('path')
const {initOAuthTokens} = require('./config/googleDrive')

// const {registerLogging} = require('./util/taskScheduler/loggingScheduler')
// const {psqlDump} = require('./util/taskScheduler/dbDumpScheduler')

// Only execute this when first deploying the app
// Please go to backend_server_url:3000 to grant access to google drive
logger.info(`[worker] started`)
// OAuth server for google drive 
initOAuthTokens(logger).catch((err) => {
    logger.error(`[Server] Unable process OAuth request for Google Drive : ${err}`)
  });
  

/* daily jobscraping testing : the below should be migrated into worker.js later*/
registerJPProcess()
registerDBDumpScheduler()
// registerEmailService()

