
const seqIdx = require('./models/index');
const {Pool} = require('pg');
require("dotenv").config();

const pool = new Pool({
    user : seqIdx.sequelize.config.username,
    password : seqIdx.sequelize.config.password,
    database : seqIdx.sequelize.config.database,
    host : seqIdx.sequelize.config.host,
    port : seqIdx.sequelize.config.port,
    ssl : { rejectUnauthorized: false }
});

module.exports = pool

