'use strict';

require('dotenv').config(); 
const  Sequelize=require('sequelize')
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

// down(queryInterface, Sequelize.DataTypes)
up(queryInterface, Sequelize.DataTypes);



async function up(queryInterface, DataTypes) {
  await queryInterface.createTable('benefit', {
    // company_name	benefit_type	benefit_details	link_to_benefit_details
    // create a composite key with company_name and benefit_type
    // benefit_type column is an enum type
    // company_name is a foreign key from company table
    // https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface#instance-method-createTable
    uuid: {
      // primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    
    company_name: {
      type: DataTypes.STRING,
      references: {
        model: 'company',
        key: 'company_name'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    benefit_type : {
      type: DataTypes.ENUM,
      values : [
        'student_loan_repayment',
        'tuition_assistance',
        'tuition_reimbursement',
        'full_tuition_coverage',
      ],
      allowNull : false
    },
    benefit_details: {
      type: DataTypes.TEXT
    },
    link_to_benefit_details: {
      type: DataTypes.TEXT
    },

  });
  
  await queryInterface.addConstraint('benefit', {
    fields: ['company_name', 'benefit_type'],
    type: 'primary key',
    name: 'benefit_pkey'
  })

  
  /* 1. add column */
  await queryInterface.addColumn('benefit', 'createdAt', {
    allowNull: false,
    type: DataTypes.DATE
  });
  await queryInterface.addColumn('benefit', 'updatedAt', {
    allowNull: false,
    type: DataTypes.DATE
  });
   await queryInterface.addColumn('benefit', 'deletedAt', {
    type: DataTypes.DATE
  });
}

async function down(queryInterface,DataTypes) {
  await queryInterface.dropTable('google_token');
}


