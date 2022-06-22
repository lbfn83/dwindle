
const {sequelize} = require('../models');
const {Pool} = require('pg');
require("dotenv").config();

const pool = new Pool({
    user : sequelize.config.username,
    password : sequelize.config.password,
    database : sequelize.config.database,
    host : sequelize.config.host,
    port : sequelize.config.port,
    ssl : { rejectUnauthorized: false }
});

module.exports = pool

