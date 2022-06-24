// https://developers.google.com/identity/protocols/oauth2/web-server#node.js_2

const fs = require('fs')
const {google_token} = require('../models')
const { google } = require('googleapis');
require('dotenv').config()
/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI.
 * To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */

 const CLIENT_ID = process.env.CLIENT_ID
 const CLIENT_SECRET = process.env.CLIENT_SECRET
 const REDIRECT_URI = process.env.REDIRECT_URI
 
 const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Refreshing an access token
oauth2Client.on('tokens', async (tokens) => {
  const {logger} = require('./logger')
  /*
  if (tokens.refresh_token) {
    // store the refresh_token in your secure persistent database
    console.log(tokens.refresh_token);
  }
  console.log(tokens.access_token);
  */
  logger.info(`[GoogleAPI oauth2Client token process] start`) 
  processOAuthToken(tokens)
  /* TODO : This won't be needed maybe? 
  it is also invoked when doing authrozing access via router
  was wondering if this event is invoked
  when google client automatically updates tokens*/
  // global.googleUserCredential =  tokens

  // const record = {token : JSON.stringify(tokens)}
  // await google_token.upsert(record).then((rtn) => {
  //   logger.info(`[GoogleAPI oauth2Client tokens event] Upserted in google_token table ${JSON.stringify(rtn)}`) 
  // })
  
});
async function processOAuthToken(tokens)
{
  const {logger} = require('./logger')

    // !!!!!!!!!!!!!!!!!!!!!
    // Sometimes refresh token might not be passed, which indicates 
    // the latest refresh token received previously is still valid. 
    if(tokens.refresh_token)
    {
      logger.info(`[GoogleAPI oauth2Client token process] tokens with refresh token received`)
      global.googleToken = tokens
    }
    else{

      let latestToken = await google_token.findOne({
        limit : 1,
        order : [['updatedAt' , 'DESC']]
      })
      // https://stackoverflow.com/questions/34698905/how-can-i-clone-a-javascript-object-except-for-one-key
      global.googleToken={...tokens, ...JSON.parse(latestToken.refresh_token)}
      logger.info(`[GoogleAPI oauth2Client token process] tokens without refresh token received`)
    }
    oauth2Client.setCredentials(global.googleToken);
    
    // const aa = await oauth2Client.getTokenInfo(tokens.access_token)
    
    /** Save credential to the global variable in case access token was refreshed.
     * ACTION ITEM: In a production app, you likely want to save the refresh token
     *              in a secure persistent database instead. */
    
    let {refresh_token, ...token_chunk} = global.googleToken
    const record = {
        token_chunk : JSON.stringify(token_chunk),
        refresh_token :  refresh_token
    }
    //  should be upserted to prevent duplicate token records
    await google_token.upsert(record).then((rtn) => {
      logger.info(`[GoogleAPI oauth2Client token process] Upserted in google_token table ${JSON.stringify(rtn)}`) 
    })

    // Example of using Google Drive API to list filenames in user's Drive.
    global.googleDrive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    })
}


async function initGoogleDrive()
{
  const {logger} = require('./logger')
  
  try{
    logger.log('info', `[GoogleAPI initGoogleDrive] started`)
    let latestToken = await google_token.findOne({
        limit : 1,
        order : [['updatedAt' , 'DESC']]
    })
    if(latestToken !== null && latestToken !== undefined)
    {   
          global.googleToken=JSON.parse(latestToken.token_chunk) 
          global.googleToken.refresh_token = latestToken.refresh_token
      
          logger.log('info', `[GoogleAPI initGoogleDrive] token pulled from db :  ${JSON.stringify(global.googleToken)}`)
          
          oauth2Client.setCredentials(global.googleToken)
          // oauth2Client how you are going to fetch it?
          global.googleDrive = google.drive({
            version: 'v3',
            auth: oauth2Client,
          })
          logger.log('info', `[GoogleAPI initGoogleDrive] google drive initialized `)
    }else{
      logger.log('error', `[GoogleAPI initGoogleDrive] no record in DB : please go to https://dwindle-backend-server.herokuapp.com/googleAuth/ to proceed`)
    }
  }catch(error)
  {
    logger.log('error', `[GoogleAPI initGoogleDrive] error : ${error}`)
  }
}


// Promise pattern  https://github.com/googleapis/google-api-nodejs-client/blob/main/samples/oauth2.js
async function uploadFile(file) {
  
  const {logger} = require('./logger')  

  return new Promise(async (resolve, reject) => {
        try {
          if(global.googleDrive){
            // parents : Folder id should be fetched to put files under this folder
            const response = await global.googleDrive.files.create({
              requestBody: {
                parents : [`${process.env.TARGET_FOLDER}`],
                name: `${file}`, //This can be name of your choice
                mimeType: 'text/plain',
              },
              media: {
                mimeType: 'text/plain',
                body: fs.createReadStream(file),
              },
            });
            logger.log('info', `[GoogleAPI uploadFile] File uploaded : ${JSON.stringify(response.data)}`)
            resolve('success')
          }else{
            logger.log('error', `[GoogleAPI uploadFile] drive object is not initialized ${global.googleDrive}`)
            reject(new Error('Drive object is not initialized'))
          }
        } catch (error) {
          logger.log('error', `[GoogleAPI uploadFile] File upload error : ${error}`)
          reject(new Error(`${error}`))
        }
    })
}
  
  
  
  
module.exports = {uploadFile, oauth2Client, initGoogleDrive}