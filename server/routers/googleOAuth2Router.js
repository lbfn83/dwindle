const express = require('express');
const router = express.Router();


const url = require('url');
const { google } = require('googleapis');
const { google_token } = require('../models')
const {logger} = require('../config/logger')
require('dotenv').config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI



/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI.
 * To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Refreshing an access token
oauth2Client.on('tokens', async (tokens) => {
    /*
    if (tokens.refresh_token) {
      // store the refresh_token in your secure persistent database
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
    */
    logger.info(`[GoogleAPI oauth2Client tokens event] start`) 

    global.googleUserCredential =  tokens

    const record = {token : JSON.stringify(tokens)}
    await google_token.upsert(record).then((rtn) => {
      logger.info(`[GoogleAPI oauth2Client tokens event] Upserted in google_token table ${JSON.stringify(rtn)}`) 
    })
    
});

// Access scopes for read-only Drive activity.
const scopes = [
    'https://www.googleapis.com/auth/drive'
];

// Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    
    /* // https://stackoverflow.com/questions/10827920/not-receiving-google-oauth-refresh-token
    prompt : 'consent' */

    /*// Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true */
});

/* Global variable that stores user credential in this code example.
 * ACTION ITEM for developers:
 *   Store user's refresh token in your data store if
 *   incorporating this code into your real app.
 *   For more information on handling refresh tokens,
 *   see https://github.com/googleapis/google-api-nodejs-client#handling-refresh-tokens
 */

router.get('/', async (req, res) => {
    // https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
    logger.info(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    logger.info(`${JSON.stringify(authorizationUrl)}`)
    try{
        logger.info(`[GoogleAPI initOAuthTokens] redirect to User Authorization page`)
        // https://masteringjs.io/tutorials/express/redirect#:~:text=The%20res.,new%20URL%20as%20shown%20below.
        res.redirect(301, authorizationUrl)
        // res.writeHead(301, { "Location": authorizationUrl });
    }catch(error)
    {
        logger.error(`[GoogleAPI initOAuthTokens] '/' error : ${error}`)
    }
    
})

router.get('/oauth2callback', async (req, res) => {
    try{

        logger.info(`[GoogleAPI initOAuthTokens] Callback from user authorization`)
        res.end('Authentication successful! Please return to the console.');  
        
        // Handle the OAuth 2.0 server response, extract Query parameters 
        let q = url.parse(req.url, true).query;

        if (q.error) { // An error response e.g. error=access_denied
          logger.error(`[GoogleAPI initOAuthTokens] Error response ${q.error}`)  
        }
        else { 
            // Get access and refresh tokens (if access_type is offline)
            let { tokens } = await oauth2Client.getToken(q.code);
            oauth2Client.setCredentials(tokens);
            
            // const aa = await oauth2Client.getTokenInfo(tokens.access_token)
            
            /** Save credential to the global variable in case access token was refreshed.
             * ACTION ITEM: In a production app, you likely want to save the refresh token
             *              in a secure persistent database instead. */
             global.googleUserCredential = tokens;
            const record = {token : JSON.stringify(tokens)}
            //  should be upsert
            await google_token.upsert(record).then((rtn) => {
              logger.info(`[GoogleAPI initOAuthTokens] Upserted in google_token table ${JSON.stringify(rtn)}`) 
            })

            // Example of using Google Drive API to list filenames in user's Drive.
            global.googleDrive = google.drive({
              version: 'v3',
              auth: oauth2Client,
            })
            logger.info(`[GoogleAPI initOAuthTokens] Finished`) 
 
        }  
      }catch(error)
      {
        logger.error(`[GoogleAPI initOAuthTokens] '/oauth2callback' error : ${error}`)
      }
})

module.exports = router