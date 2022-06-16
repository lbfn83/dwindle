// Load environment variable from .env file
require('dotenv').config();


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
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        database: String(process.env.PROD_DB_NAME).toLowerCase(),
        host: process.env.PROD_DB_HOST,
        dialect: 'postgres',
        port : process.env.PROD_DB_PORT 
    }
};