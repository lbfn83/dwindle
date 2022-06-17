// cf) How to Handle File Uploads from Node.js to Express
// https://www.twilio.com/blog/handle-file-uploads-node-express

// Below code is introduced in 
// https://www.youtube.com/watch?v=1y0-IfRW114
// https://console.cloud.google.com/apis/credentials/consent?project=ultra-depot-352115

// Should study about OAuth protocol
// https://spanning.com/blog/oauth-2-what-is-it-how-does-it-work/
// https://developers.google.com/identity/protocols/oauth2

// Google's drive api guide and reference
// https://developers.google.com/drive/api/guides/search-files#node.js
// guide has a really good examples

require('dotenv').config()
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
// const logger = require('./logger')


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});


// Googleapis lib : files' methods reference
// https://developers.google.com/drive/api/v3/reference/files/list


// Rsync might not be possible... unless I have up and running extra server
// Instead stick to the google api to synchonize the file
// https://cloud.google.com/blog/products/application-development/sync-google-drive-files-to-apps-using-the-drive-rest-api-bidding-farewell-to-the-drive-android-api

async function uploadFile(file, logger) {
  try {
    
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
    logger.log('info', `[GoogleAPI] File uploaded : ${JSON.stringify(response.data)}`)
    
  } catch (error) {
    logger.log('error', `[GoogleAPI] File upload error : ${error}`)
  }
}


module.exports = {uploadFile}