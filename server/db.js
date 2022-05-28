
const seqIdx = require('./models/index');
const {Pool} = require('pg');
require("dotenv").config();

const pool = new Pool({
    user : seqIdx.sequelize.config.username,
    password : seqIdx.sequelize.config.password,
    database : seqIdx.sequelize.config.database,
    host : seqIdx.sequelize.config.host,
    port : seqIdx.sequelize.config.port
});

module.exports = pool

// user : process.env.DATABASE_USER,
// password : process.env.DATABASE_PWD,
// database : process.env.DATABASE_NAME,
// host : process.env.DATABASE_HOST,
// port : process.env.DATABASE_PORT