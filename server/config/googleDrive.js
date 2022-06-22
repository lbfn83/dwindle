// https://developers.google.com/identity/protocols/oauth2/web-server#node.js_2

const fs = require('fs')
require('dotenv').config()
// let userCredential = null;
// let drive = null;

// Promise pattern  https://github.com/googleapis/google-api-nodejs-client/blob/main/samples/oauth2.js
async function uploadFile(file, logger) {
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
  
  
  
  
module.exports = {uploadFile}