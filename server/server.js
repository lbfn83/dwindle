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

const bp = require('body-parser')

const {initDatabase} = require('./util/setupDatabase')

const {dailyJobScraping} = require('./util/scheduler')

const {pullJobPostings} = require('./controllers/jobPostingFetcher')
const {jobPostingDataPurge} = require('./controllers/jobPostingDataPurge')
const {setupCompanyListFromTxt} = require('./controllers/companyListInit');
const { sequelize } = require('./models');

require('dotenv').config()
// console.log(process.env)

// console.log("build path : " , buildPath)
// app.use(express.static(buildPath));
app.use(cors());
app.use(bp.json())


/* !!!! use below to use sync command to create database and tables !!!!*/ 
// initDatabase();

sequelize.authenticate().then(() => {
  console.log('[Server]Connection established successfully.');
}).catch(err => {
  console.error('[Server]Unable to connect to the database:', err)});
dailyJobScraping();
// pullJobPostings();

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



// TODO: preliminary admin console. might have to build a seperate router for this 
// When all of DB tables are set up 
app.get("/admin", (req, res) => res.sendFile(`${__dirname}/static/index.html`))

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});


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
