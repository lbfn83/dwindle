'use strict';

require('dotenv').config(); 
const  Sequelize = require('sequelize')
const { Op } = require("sequelize");
const env = process.env.NODE_ENV || 'development';
const config = require('../config/seqConfig.js')[env];
// don't want to pluralize table name
config.define = {"freezeTableName" : true}
config.dialectOptions = {ssl: {
  require: true,
  rejectUnauthorized: false, // very important
}}
let sequelize;

sequelize = new Sequelize(config.database, config.username, config.password, config);
const queryInterface = sequelize.getQueryInterface()

// https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface#instance-method-bulkUpdate
up(queryInterface, Sequelize.DataTypes);


// Adding column doesn't affect records from table

async function up(sequelize, DataTypes) {
  try{

    const result = await queryInterface.sequelize.query(`ALTER TABLE jobposting ALTER COLUMN posted_date TYPE DATE using posted_date::date;`);
    console.log(result)


  }catch(e)
  {
    console.log(e)
  }

}

async function down(queryInterface,DataTypes) {
  
}


