const express = require('express');
const router = express.Router();


const url = require('url');
const { google } = require('googleapis');
const { google_token } = require('../models')
const {logger} = require('../config/logger')
const {oauth2Client} = require('../config/googleDrive')
require('dotenv').config()

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

// TODO: message in here won't be logged. why? 
// should study router later 
router.get('/', async (req, res) => {
    // https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
    logger.info(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    logger.info(`${JSON.stringify(authorizationUrl)}`)
    try{
        logger.info(`[GoogleAPI router initOAuthTokens] redirect to User Authorization page`)
        // https://masteringjs.io/tutorials/express/redirect#:~:text=The%20res.,new%20URL%20as%20shown%20below.
        res.redirect(301, authorizationUrl)
        // res.writeHead(301, { "Location": authorizationUrl });
    }catch(error)
    {
        logger.error(`[GoogleAPI router initOAuthTokens] '/' error : ${error}`)
    }
    
})

router.get('/oauth2callback', async (req, res) => {
    try{

        logger.info(`[GoogleAPI router initOAuthTokens] Callback from user authorization`)
        res.end('Authentication successful! Please return to the console.');  
        
        // Handle the OAuth 2.0 server response, extract Query parameters 
        let q = url.parse(req.url, true).query;

        if (q.error) { // An error response e.g. error=access_denied
          logger.error(`[GoogleAPI router initOAuthTokens] Error response ${q.error}`)  
        }
        else { 
            // Get access and refresh tokens (if access_type is offline)
            // token event will be invoked, please refer to googleDrive.js 'token' event listner
            let { tokens } = await oauth2Client.getToken(q.code);
            logger.info(`[GoogleAPI router initOAuthTokens] Finished`) 
 
        }  
      }catch(error)
      {
        logger.error(`[GoogleAPI router initOAuthTokens] '/oauth2callback' error : ${error}`)
      }
})

module.exports = router