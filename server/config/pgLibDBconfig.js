
// const {sequelize} = require('../models');
const seqConfig = require('./seqConfig');
const {Pool} = require('pg');
require("dotenv").config();

const {NODE_ENV} = process.env;
let connectionStr = undefined;

if(NODE_ENV !== undefined)
{
    let pool = undefined;
    if(NODE_ENV !== 'development')
    {
        connectionStr = seqConfig[NODE_ENV];
        pool = new Pool({
            user : connectionStr.username,
            password : connectionStr.password,
            database : connectionStr.database,
            host : connectionStr.host,
            port : connectionStr.port,
            ssl : { rejectUnauthorized: false }
        });
    }else{
        connectionStr = seqConfig[NODE_ENV];
        pool = new Pool({
            user : connectionStr.username,
            password : connectionStr.password,
            database : connectionStr.database,
            host : connectionStr.host,
            port : connectionStr.port,
            // ssl : { rejectUnauthorized: false }
        });
    }
    
    module.exports = pool
}else{
    throw Error("NODE_ENV should be defined to enable pg!");
}


