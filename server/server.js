// This is not for express server
// import { RAPID_API_KEY } from './util/constants';


const path = require('path');
const axios = require('axios');
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const buildPath = path.join(__dirname, '..', 'build');
const subscribeRouter = require('./routers/subscribeRouter.js')
const bp = require('body-parser')
const {Client} = require('pg')

require('dotenv').config()
// console.log(process.env)


// console.log("build path : " , buildPath)
// app.use(express.static(buildPath));
app.use(cors());
app.use(bp.json())

initDatabase();

app.use('/email' , subscribeRouter)

// '{"search_terms":"target","location":"","page":"1","fetch_full_text":"yes"}'
app.get('/jobs', async (req, res) => {
    // console.log("req from client : ", req)
  try {
      let { search_terms = '',location = '', page = '1',fetch_full_text = 'yes' } = req.query;
   
    search_terms = search_terms ? encodeURIComponent(search_terms) : '';
    location = location ? encodeURIComponent(location) : '';
    

    // full_time = full_time === 'true' ? '&full_time=true' : '';

    //   TODO: page should be customized to iterate incrementally until meet the end of total pages.
    /*
    if (page) {
      page = parseInt(page);
      page = isNaN(page) ? '' : `&page=${page}`;
    }
    */

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
        data: `{"search_terms":"${search_terms}","location":"${location}","page":"${page}","fetch_full_text": "${fetch_full_text}"}`
      };  

    const result = await axios.request(query)
    // From Linked in to our backend server, we got object as a response, not string
    // console.log("result : " , result)
    console.log("result Data in server: ", result)
    res.send(result.data);

  } catch (error) {
    console.log("error :" , error)
    res.status(400).send('Error while getting list of jobs.Try again later.');
  }
});


// TODO: preliminary admin console. might have to build a seperate router for this 
// When all of DB tables are set up 
app.get("/admin", (req, res) => res.sendFile(`${__dirname}/static/index.html`))

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

// Automatically create Database if it doesn't exist and same applies to tables
// This function will try connection to local DB with postgres credential ( defualt credential)
async function initDatabase() {
  // create db if it doesn't already exist
  const client = new Client(
    {
      host : process.env.DATABASE_HOST,
      port : process.env.DATABASE_PORT,
      user : 'postgres',
      password: process.env.DATABASE_PWD
    }
  );
  
  let dbExist = false;
  const dbName = process.env.DATABASE_NAME;

  // connect to db with default credential in Postgres
  client.connect( err => {
    if(err){
      console.error('[initDatabase] DB connection error : ', err.stack)
    } else {
      console.log('[initDatabase] DB connected')
    }
  })
  // Check if Database already exists
  const result = await client.query('SELECT datname FROM pg_database');
  
  result.rows.forEach(item => {
    
    // console.log('[initDatabase] datname : ',item.datname);
    if(item.datname === dbName)
    {
      dbExist = true;
    }
  })
  // if it doesn't exist, create one 
  if(!dbExist)
  {
    console.log(`[initDatabase] Start \'${dbName}\' Database Creation`);
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
    }catch(error)
    {
      console.error('[initDatabase] DB Creation error : ', err.stack)
    }
  }else
  {
    console.log(`[initDatabase] Database ${dbName} already exists`)
  }
  

  const sequelize = new Sequelize(dbName, user, password, { dialect: 'mysql' });

  // // init models and add them to the exported db object
  // db.User = require('../users/user.model')(sequelize);

  // // sync all models with database
  // await sequelize.sync();
}
