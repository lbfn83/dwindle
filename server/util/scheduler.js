const cron = require('node-cron')
const {pullJobPostings} = require('../controllers/jobPostingFetcher')
const {jobPostingDataPurge} = require('../controllers/jobPostingDataPurge')

function dailyJobScraping() {
    // runs daily at certain hour and minute
    cron.schedule('01 10 * * *', () => {
        console.log("[daily job scraping] start! ")

        pullJobPostings().then(async()=>{
            await jobPostingDataPurge()
          }).then(()=> {
            console.log("[daily job scraping] finished! ")
          })
    },
    {
        // recover missed executions 
        recoverMissedExecutions : true
    })
}


module.exports = {dailyJobScraping}