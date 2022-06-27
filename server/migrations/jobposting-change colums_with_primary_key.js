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

async function up(queryInterface, DataTypes) {

  // How to change primary key of an existing table
  // https://gist.github.com/scaryguy/6269293
  
  //  1. composite keys? one single primary key is a must in each table but you can remove the primary key
  //  https://kb.objectrocket.com/postgresql/postgresql-composite-primary-keys-629
  //  how to change primary column in a table
  //  https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface
  
  await queryInterface.removeConstraint('jobposting',  'jobposting_pkey')
  
  // below doens't add primary key back... primaryKey might not be Query options for changeColumn
  await queryInterface.changeColumn('jobposting', 'linkedin_job_url_cleaned', {
    type : DataTypes.TEXT,
    primaryKey: true
  })
  
  // add primary key constraints back 
  await queryInterface.addConstraint('jobposting', {
    fields: ['linkedin_job_url_cleaned'],
    type: 'primary key',
    name: 'jobposting_pkey'
  })


}

async function down(queryInterface,DataTypes) {
  
}


