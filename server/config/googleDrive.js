// https://developers.google.com/identity/protocols/oauth2/web-server#node.js_2

const http = require('http');
const https = require('https');
const url = require('url');
const { google } = require('googleapis');
const { google_token } = require('../models')
const fs = require('fs')
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

    userCredential =  tokens

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
let userCredential = null;
let drive = null;


async function initOAuthTokens(logger) {
    const server = http.createServer(async function (req, res) {
        // Right after deployment in production, go visit production URL
        if (req.url == '/') {
          try{
              logger.info(`[GoogleAPI initOAuthTokens] redirect to User Authorization page`)
              res.writeHead(301, { "Location": authorizationUrl });
          }catch(error)
          {
              logger.error(`[GoogleAPI initOAuthTokens] '/' error : ${error}`)
          }
        }
        // Receive the callback from Google's OAuth 2.0 server.
        if (req.url.startsWith('/oauth2callback')) {
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
                userCredential = tokens;
                const record = {token : JSON.stringify(tokens)}
                //  should be upsert
                await google_token.upsert(record).then((rtn) => {
                  logger.info(`[GoogleAPI initOAuthTokens] Upserted in google_token table ${JSON.stringify(rtn)}`) 
                })

                // Example of using Google Drive API to list filenames in user's Drive.
                drive = google.drive({
                  version: 'v3',
                  auth: oauth2Client,
                })
                logger.info(`[GoogleAPI initOAuthTokens] Finished`) 
     
            }  
          }catch(error)
          {
            logger.error(`[GoogleAPI initOAuthTokens] '/oauth2callback' error : ${error}`)
          }
        }

        // Example on revoking a token
        if (req.url == '/revoke') {
              // Build the string for the POST request
              let postData = "token=" + userCredential.access_token;

              // Options for POST request to Google's OAuth 2.0 server to revoke a token
              let postOptions = {
                  host: 'oauth2.googleapis.com',
                  port: '443',
                  path: '/revoke',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                  }
              };

              // Set up the request
              const postReq = https.request(postOptions, function (res) {
                  res.setEncoding('utf8');
                  res.on('data', d => {
                    console.log('Response: ' + d);
                  });
              });

              postReq.on('error', error => {
                 console.log(error)
              });

              // Post the request with data
              postReq.write(postData);
              postReq.end();
        }
        res.end();

    }).listen(3000);
}





// Promise pattern  https://github.com/googleapis/google-api-nodejs-client/blob/main/samples/oauth2.js
async function uploadFile(file, logger) {
    return new Promise(async (resolve, reject) => {
        try {
          if(drive){
            // parents : Folder id should be fetched to put files under this folder
            const response = await drive.files.create({
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
            logger.log('error', `[GoogleAPI uploadFile] drive object is not initialized : userCredential is ${userCredential}`)
            reject(new Error('Drive object is not initialized'))
          }
        } catch (error) {
          logger.log('error', `[GoogleAPI uploadFile] File upload error : ${error}`)
          reject(new Error(`${error}`))
        }
    })
}
  
  
  
  
module.exports = {uploadFile, initOAuthTokens}