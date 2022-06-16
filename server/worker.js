const {registerJPProcess} = require('./util/taskScheduler/jobpostingFetchScheduler')
const {registerLogging} = require('./util/taskScheduler/loggingScheduler')
const {backup} = require('./util/taskScheduler/dbDumpScheduler')
const {importFromCSV} = require('./util/obsolete/dbBackupToCSV')
const {registerDBBackupScheduler} = require('./util/taskScheduler/dbBackupScheduler')
const path = require('path')

const {dailyJobScraping} = require('./util/obsolete/cronScheduler')

const {pullJobPostings} = require('./controllers/jobPostingFetcher')
const {jobPostingDataPurge} = require('./controllers/jobPostingDataPurge')
const {setupCompanyListFromTxt} = require('./controllers/companyListInit');



const tablename = 'company'
const filename = 'company.csv'
const backupLoc = path.join(__dirname, filename)

importFromCSV(tablename, backupLoc)
/* daily jobscraping testing : the below should be migrated into worker.js later*/
// registerJPProcess()
// registerLogging()
// registerDBBackupScheduler()
// backup()