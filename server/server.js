// constant.js is now obsolete as we are using dotenv for security
// import { RAPID_API_KEY } from './util/constants';


const path = require('path');
const axios = require('axios');
const cors = require('cors');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const buildPath = path.join(__dirname, '..', 'build');
const companyRouter = require('./routers/companyRouter')
const subscribeRouter = require('./routers/subscribeRouter')
const jobpostingRouter = require('./routers/jobPostingRouter')

const bp = require('body-parser')
const {Client} = require('pg')
// const Client= require('pg-promise')

// Sequelize model import
const {sequelize} = require('./models')
const  jobPostingFetcher = require('./controllers/jobPostingFetcher')
const {setupCompanyListFromTxt} = require('./controllers/companyListInit')
require('dotenv').config()
// console.log(process.env)


// console.log("build path : " , buildPath)
// app.use(express.static(buildPath));
app.use(cors());
app.use(bp.json())

let initialDBconnectionParam = 
{
  host : process.env.DATABASE_HOST,
  port : process.env.DATABASE_PORT,
  user : 'postgres',
  password: process.env.POSTGRES_PWD
}

initDatabase();


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

/* Below API End point is now obsolete as this application is not designed for open and exhaustive job search 
only pull job postings from RapidAPI/LinkedIn once in a day that are from company providing student debt benefits   */
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

// TODO: preliminary admin console. might have to build a seperate router for this 
// When all of DB tables are set up 
app.get("/admin", (req, res) => res.sendFile(`${__dirname}/static/index.html`))

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});


// Automatically create Database if it doesn't exist and same applies to tables
// This function will try to connect to the local DB with postgres credential ( defualt credential)
async function initDatabase() {

  // create database if it doesn't already exist
  // let's say someone just installed postgresql without adding any extra user or any configuration
  // how can you make things easier for them like creating user and setting up tables automatically 
  const client = new Client(
    initialDBconnectionParam
  );

  // console.log(client)
  
  // DB name for DB connect query in postgres are by default converted to lowercase letters in here
  // Since Postgres only takes CamelCase words with special care : should be wrapped with "". 
  // Sequelize connection info is defined in models/index.js
  const dbName = process.env.DATABASE_NAME.toLowerCase();
  
  // connect to db with a default credential in Postgres
  client.connect( async (err) => {
    if(err){
        console.error('[initDatabase] DB connection error : ', err);
    } 
    else {
        console.log('[initDatabase] DB connected');
        await CreateDB().then( async () => {
            try {
            
                await sequelize.authenticate();
                // await sequelize.sync({force : true})
                // await sequelize.sync({alter : true})
                
                console.log('[initDatabase] Connection has been established successfully.');

                /* Below is just one time usage for first set up production database*/
                
                // const CompanyEntriesInserted = await setupCompanyListFromTxt().then((rtn) => 
                //   {
                //     console.log('[initDatabase]CompanyEntriesInserted : ' , rtn)
                //   })
            
                // await jobPostingFetcher.jobPostingQueryOptionBuilder().then((rtn) => {
                //   rtn.forEach((elem, idx) => {
                //     console.log('[initDatabase]Job Postings pulled in ', idx, '. ' , elem);  
                //   })  
                // })
            } 
            catch (error) {
                console.error('[initDatabase]Unable to connect to the database:', error);
            }
          } 
        );  
      }
  })


  
  async function CreateDB()
  {
    const dbExist = await CheckDBexist(dbName);
    // console.log('[initDatabase] dbExist : ', dbExist )

    // if it doesn't exist, create one 
    if(!dbExist)
    {
        console.log(`[initDatabase] Start \'${dbName}\' Database Creation`);
        try {
          const response = await client.query(`CREATE DATABASE ${dbName}`);
          // console.log(`[initDatabase] db creation result : `, response);
          // return await new Promise(r => setTimeout(r, 3000));
        }catch(error)
        {
          console.error('[initDatabase] DB Creation error : ', error)
        }
    }else
    {
        console.log(`[initDatabase] Database ${dbName} already exists`)
    }
    // return;
  }

  async function CheckDBexist(dbName)
  {
    // Check if Database already exists
    // but when you create Database should change its credentials to USER not postgres
    const result = await client.query('SELECT datname FROM pg_database');
    // console.log(`[initDatabase] CheckDBexist : `, result, ` : ` , dbName)       
    
    let rtnVal = false

    result.rows.forEach( (item) => {  
        // console.log('[initDatabase] datname : ',item.datname);
        if(item.datname === dbName)
        {
           rtnVal = true;
        }
    })
    return rtnVal;
  } 
          
  // DB connection with Sequelize
  /*
  sequelize.authenticate().then(() => {
    console.log('Connection established successfully.');
  }).catch(err => {
    console.error('Unable to connect to the database:', err)});
    */
   
   // // init models and add them to the exported db object
   // db.User = require('../users/user.model')(sequelize);
   
   
   
   /*
    1. This is most important point that I was confused about Sequelize
    thought that define sequelize instance manually like below will work
    but invoking sync() with below doesnt create models(tables) defined in models folder. 
    that is because "models: { subscriberTest: subscriberTest }" props should also be manually defined 
    with manual approach.  


    const sequelize = new Sequelize(dbName, process.env.DATABASE_USER, process.env.DATABASE_PWD, { dialect: 'postgres' });
    
    2. console.log("[server.js]",sequelize)
    sequelize instance read from model index actually have correct db connection information
    when and how does it get this information?
    models/index.js fetch this information from config.json

    3. For now, my implementation contains both of pg and sequelize libs and
    for that reason, parameters for db connection should be typed in
    seperately both of config.js and .env. Should fix this by injecting 
    environment variables, defined in .env, into config instance in models/index.js file
  
    */
   

   
}


/*Check USER exist */
        // check DB user is defined. 
        // try{
        //   const userExistQueryResult = await client.query(`SELECT 1 FROM pg_roles WHERE rolname=\'${process.env.DATABASE_USER}\'`);
          
        //   // Result contains 'rows: []' and 'rowCount: 0' if user doens't exist
        //   // console.log('[initDatabase] ', userExistQueryResult);
        //   // const userExist = Object.values(userExistQueryResult.rows);

          
        //   if( userExistQueryResult.rowCount === 0 )
        //   { 
        //     console.log('[initDatabase] user doesn\'t exist, so let\'s create ');
        //     // user creation
        //     // you can't use with password thouh
        //     client.query(`CREATE USER ${process.env.DATABASE_USER}  WITH PASSWORD '${process.env.DATABASE_PWD}'`)
        //      client.query(`alter user ${process.env.DATABASE_USER} superuser `)
        //      client.query(`alter user ${process.env.DATABASE_USER} with CREATEDB CREATEROLE;`)
        //   }
                    
        //   }catch(error)
        //   {
        //     console.log('[initDatabase] User credential check error :', error)
        //   }