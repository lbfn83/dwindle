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
  await queryInterface.createTable('loc_lookup', {
     
    job_location_str: {
      type: DataTypes.TEXT,
      allowNull : false, 
      primaryKey: true
    },
    std_loc_str : {
      type: DataTypes.TEXT,
      allowNull : false
    }

  });
  /* 1. add column */
  await queryInterface.addColumn('loc_lookup', 'createdAt', {
    allowNull: false,
    type: DataTypes.DATE
  });
  await queryInterface.addColumn('loc_lookup', 'updatedAt', {
    allowNull: false,
    type: DataTypes.DATE
  });
  await queryInterface.addColumn('loc_lookup', 'need_to_be_reviewed', {
    allowNull: false,
    type: DataTypes.BOOLEAN
  });
}

async function down(queryInterface,DataTypes) {
  await queryInterface.dropTable('loc_lookup');
}


