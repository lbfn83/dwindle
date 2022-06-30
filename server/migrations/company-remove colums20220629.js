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


  // await queryInterface.removeColumn('company', 'student_loan_repayment')

  // await queryInterface.removeColumn('company', 'full_tuition_coverage')

  // await queryInterface.removeColumn('company', 'tuition_reimbursement')

  // await queryInterface.removeColumn('company', 'tuition_assistance')

  await queryInterface.removeColumn('company', 'benefit_details')
  await queryInterface.removeColumn('company', 'link_to_benefit_details')



}

async function down(queryInterface,DataTypes) {
  
}


