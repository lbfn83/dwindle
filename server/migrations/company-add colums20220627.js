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

  // await queryInterface.addColumn('company', 'student_loan_repayment', {
    
  //     type: DataTypes.BOOLEAN,
  //     defaultValue : true,
  //     allowNull: false
  // });

  // await queryInterface.addColumn('company', 'full_tuition_coverage', {
    
  //   type: DataTypes.BOOLEAN,
  //   defaultValue : true,
  //   allowNull: false
  // });

  // await queryInterface.addColumn('company', 'tuition_assistance', {
    
  //   type: DataTypes.BOOLEAN,
  //   defaultValue : true,
  //   allowNull: false
  // });

  // await queryInterface.addColumn('company', 'tuition_reimbursement', {
    
  //   type: DataTypes.BOOLEAN,
  //   defaultValue : true,
  //   allowNull: false
  // });

  // await queryInterface.renameColumn('company', 'companyname', 'company_name')

  // await queryInterface.removeColumn('company', 'description')

  // await queryInterface.removeColumn('company', 'benefits')

  // await queryInterface.addColumn('company', 'company_jobpage', {
  //    type: DataTypes.TEXT
  // })
  // await queryInterface.addColumn('company', 'company_website', {
  //   type: DataTypes.TEXT
  // })
  // await queryInterface.addColumn('company', 'industry', {
  //   type: DataTypes.TEXT
  // })
  // await queryInterface.addColumn('company', 'imagelink', {
  //   type: DataTypes.TEXT
  // })
  // await queryInterface.addColumn('company', 'company_summary', {
  //   type: DataTypes.TEXT
  // })
  // await queryInterface.addColumn('company', 'company_description', {
  //   type: DataTypes.TEXT
  // })
  // await queryInterface.addColumn('company', 'benefit_details', {
  //   type: DataTypes.TEXT
  // })
  // await queryInterface.addColumn('company', 'link_to_benefit_details', {
  //   type: DataTypes.TEXT
  // })
  await queryInterface.changeColumn('company', 'student_loan_repayment', {
    
    type: DataTypes.BOOLEAN,
    defaultValue : false,
    allowNull: false
  });

  await queryInterface.changeColumn('company', 'full_tuition_coverage', {
    
    type: DataTypes.BOOLEAN,
    defaultValue : false,
    allowNull: false
  });

  await queryInterface.changeColumn('company', 'tuition_assistance', {
    
    type: DataTypes.BOOLEAN,
    defaultValue : false,
    allowNull: false
  });

  await queryInterface.changeColumn('company', 'tuition_reimbursement', {
    
    type: DataTypes.BOOLEAN,
    defaultValue : false,
    allowNull: false
  });
}

async function down(queryInterface,DataTypes) {
  
}


