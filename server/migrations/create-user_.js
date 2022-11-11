'use strict';

require('dotenv').config(); 
const  Sequelize=require('sequelize')
const env = process.env.NODE_ENV || 'development';
const config = require('../config/seqConfig')[env];
// don't want to pluralize table name
config.define = {"freezeTableName" : true}
config.dialectOptions = {ssl: {
  require: true,
  rejectUnauthorized: false, // very important
}}
let sequelize;

sequelize = new Sequelize(config.database, config.username, config.password, config);
const queryInterface = sequelize.getQueryInterface()

up(queryInterface, Sequelize.DataTypes);



async function up(queryInterface, DataTypes) {
  await queryInterface.createTable('user', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,

    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, );
}

async function down(queryInterface,DataTypes) {
  await queryInterface.dropTable('user');
}


