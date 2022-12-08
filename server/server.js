// constant.js is now obsolete as we are using dotenv for security
// import { RAPID_API_KEY } from './util/constants';
// const axios = require('axios');


const path = require('path');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;
const userRouter = require('./routes/user')
const companyRouter = require('./routes/company')
const subscribeRouter = require('./routes/subscribeRouter')
const jobpostingRouter = require('./routes/jobPostingRouter')
const googleOAuth2Router = require('./routes/googleOAuth2Router')
const bp = require('body-parser')

const { sequelize, jobposting} = require('./models');

const {logger, shutdown} = require('./config/logger')

// const {initDatabase} = require('./util/setupDatabase')

// console.log("build path : " , buildPath)
// app.use(express.static(buildPath));
app.use(cors());
app.use(bp.json());

app.use(morgan('combined', {stream : {
  write : (msg) => logger.info(msg.trim()),
}}));
/**express session prac  */
// const session = require('express-session');
// //  store: 'MemoryStore'
// app.use(session({secret: 'my secret', resave: true, saveUninitialized: true}));
// app.use((req, res, next) => {
//   res.locals.test = req.session.test;
//   // middleware SHOULD have this, man...
//   console.log("locals" ,res.locals)
//   next();
// })
// app.get('/', async(req, res, next) => {
//   console.log("get get")
//   res.locals.test = "Asdf";
// });





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

if(process.env.NODE_ENV !== 'development')
{
  const {registerJPProcess} = require('./util/taskScheduler/jobpostingFetchScheduler');
  const {registerDBDumpScheduler} = require('./util/taskScheduler/dbDumpScheduler');
  const {registerGoogleTKpurgeScheduler} = require('./util/taskScheduler/googleTKpurgeScheduler');
  const {registerTemplateCreateService} = require('./util/taskScheduler/templateCreateScheduler');

  registerGoogleTKpurgeScheduler();
  registerJPProcess();
  registerDBDumpScheduler();
  registerTemplateCreateService();

}

app.use('/', userRouter);
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
// express default error handler
app.use((err, req, res, next) => {
  
  logger.error(`[Defualt Error Handler] ${JSON.stringify(err.stack)}`);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({ message : message, data : data});
})

// Termination signal handling
// https://help.heroku.com/KR6BGO6A/what-do-relocating-dyno-to-a-new-server-messages-mean
// SIGTERM is the only event acutally required to deploy in Heroku
process
.on('SIGTERM', shutdown('SIGTERM'))
.on('SIGINT',  shutdown('SIGINT'))
.on('uncaughtException', shutdown('uncaughtException'));



app.listen(PORT, () => {
  logger.log('info', `[server] : server started on port ${PORT}`)
});




// below is added for the test code
// https://stackoverflow.com/questions/33986863/mocha-api-testing-getting-typeerror-app-address-is-not-a-function
module.exports = app;