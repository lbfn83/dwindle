// constant.js is now obsolete as we are using dotenv for security
// import { RAPID_API_KEY } from './util/constants';
// const axios = require('axios');


const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const companyRouter = require('./routers/companyRouter')
const subscribeRouter = require('./routers/subscribeRouter')
const jobpostingRouter = require('./routers/jobPostingRouter')
const googleOAuth2Router = require('./routers/googleOAuth2Router')
const bp = require('body-parser')

const { sequelize, jobposting} = require('./models');

const {logger} = require('./config/logger')

// const {initDatabase} = require('./util/setupDatabase')

// console.log("build path : " , buildPath)
// app.use(express.static(buildPath));
app.use(cors());
app.use(bp.json());

/* !!!! use below to invoke sync() to newly create database and tables 
* only use this in Iaas or Local server to initialize database !!!! 
*/
// initDatabase();

/* forcefully Drop and create Tables : use with caution! */
// (async() => {
//   await sequelize.sync({force : true}).then(()=>{
//     console.log("sync done")
//   })
// })();



(async() => {
  await sequelize.authenticate().then(async() => {
    logger.log('info', `[Server] DB Connection established successfully.`);
    await jobposting.addFullTextIndex(logger);
    logger.log('info', `[Server] Full Text Search setting done.`);
  }).catch(err => {
    logger.log('error', `[Server] Unable to connect to the database : ${err}`);
})})();



// Alternative method that can be used in case of handling multiple routers
// https://www.cloudnativemaster.com/post/how-to-add-multiple-routers-in-a-node-application-without-using-app-use-for-each-router
/*
fs.readdirSync(routes_directory).forEach(route_file => {
  try {
    app.use('/', require(routes_directory + route_file)());
  } catch (error) {
    console.log(`Encountered Error initializing routes from ${route_file}`);
    console.log(error);
  }
});
*/
/* ********* Schedulers *********** */
// const {registerCampaignCreateService} = require('./util/taskScheduler/campaignCreateScheduler');
// const {registerCampaignSendService} = require('./util/taskScheduler/campaignSendScheduler');
// const {registerCampaignUpdateService} = require('./util/taskScheduler/campaignUpdateScheduler');
const {registerJPProcess} = require('./util/taskScheduler/jobpostingFetchScheduler');
const {registerDBDumpScheduler} = require('./util/taskScheduler/dbDumpScheduler');
const {registerGoogleTKpurgeScheduler}= require('./util/taskScheduler/googleTKpurgeScheduler');

registerGoogleTKpurgeScheduler();
registerJPProcess();
registerDBDumpScheduler();


/* **** google API OAuth2 ****** */
const {initGoogleDrive} = require('./config/googleDrive');

global.googleToken = null;
global.googleDrive = null;
initGoogleDrive()

app.use('/googleAuth', googleOAuth2Router)

/* ***************************************** */

app.use('/database', jobpostingRouter)
app.use('/database' , subscribeRouter)
app.use('/database' , companyRouter)


app.get('/files', (req, res, next) => {
  const options = {
    root: path.join(__dirname, 'data'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
  res.sendFile('company_list.txt', options);
})



/*        **************        */

// TODO: preliminary admin console. might have to build a seperate router for this 
// When all of DB tables are set up 
app.get("/admin", (req, res) => res.sendFile(`${__dirname}/static/index.html`))

app.listen(PORT, () => {
  logger.log('info', `[server] : server started on port ${PORT}`)
});


/*  Test for winston logger in production*/

// setInterval(()=>{
//   logger.info('TEST')
//   logger.log('info', 'Hi, guys')
// }, 10000)


/* Below API End point is now obsolete as this application is not designed for open and exhaustive job search but only for
pulling job postings from company on the list once in a day    */
/*
app.get('/jobs', async (req, res) => {
    // console.log("req from client : ", req)
  try {
      let { search_terms = '',location = '', page = '1',fetch_full_text = 'yes' } = req.query;
   
    search_terms = search_terms ? encodeURIComponent(search_terms) : '';
    location = location ? encodeURIComponent(location) : '';
    


    // TODO : something that should be used later when making multiple request altogether 
    // axios.all([
    // axios.get('https://api.github.com/users/mapbox'),
    // axios.get('https://api.github.com/users/phantomjs')
    // ])


    const query = {
        method: 'POST',
        url: 'https://linkedin-jobs-search.p.rapidapi.com/',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
          'X-RapidAPI-Key': `${process.env.API_KEY}`
        },  
        // TODO : should  replace 'single quote into null 
        data: `{"search_terms":"${search_terms}","location":"${location}","page":"${page}","fetch_full_text": "${fetch_full_text}"}`
      };  
    // console.log("query!!!!!!   ", query)
    const result = await axios.request(query)
    // From Linked in to our backend server, we got object as a response, not string

    // console.log("result Data in server: ", result)
    res.send(result.data);

  } catch (error) {
    console.log("error :" , error)
    res.status(400).send('Error while getting list of jobs.Try again later.');
  }
});
*/
