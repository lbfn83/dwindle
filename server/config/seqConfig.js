// Load environment variable from .env file
require('dotenv').config();
const parseDbUrl = require("parse-database-url");

// Below is for heroku production environment deploying heroku postgres
// DATABASE_URL is automatically registered in heroku app and updated on regular basis
let usernamePD
let passwordPD
let databasePD
let hostPD
let portPD 

if(process.env.DATABASE_URL !== undefined)
{
    const dbConfig = parseDbUrl(process.env.DATABASE_URL);
    usernamePD = dbConfig.user;
    passwordPD = dbConfig.password;
    databasePD = dbConfig.database;
    hostPD = dbConfig.host;
    portPD = dbConfig.port;
}else{
    usernamePD = process.env.PROD_DB_USERNAME;
    passwordPD = process.env.PROD_DB_PASSWORD;
    databasePD = process.env.PROD_DB_NAME;
    hostPD = process.env.PROD_DB_HOST;
    portPD = process.env.PROD_DB_PORT;
}


module.exports = {
    development: {
        username: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD,
        // Using Camelcase creates unnecessary headache when handling postgres
        // so decided to get DB name converted to lowercase letters or otherwise it should be always wrapped with double quotes
        database: String(process.env.DEV_DB_NAME).toLowerCase(),
        host: process.env.DEV_DB_HOST,
        dialect: 'postgres', 
        port : process.env.DEV_DB_PORT 
    },
    test: {
        username: process.env.TEST_DB_USERNAME,
        password: process.env.TEST_DB_PASSWORD,
        database: String(process.env.TEST_DB_NAME).toLowerCase(),
        host: process.env.TEST_DB_HOST,
        dialect: 'postgres',
        port : process.env.TEST_DB_PORT 
    },
    production: {
        username: usernamePD,
        password: passwordPD,
        database: String(databasePD).toLowerCase(),
        host: hostPD,
        dialect: 'postgres',
        port : portPD
    }
};

