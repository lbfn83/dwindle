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

  // await queryInterface.renameColumn('user', 'userid', 'id')

  // await queryInterface.removeColumn('company', 'job_scraper') 

  /* */
  await queryInterface.bulkUpdate('company', {'job_scraper' : true }, 
        
            {companyname : 
                  { [Op.notLike]: 'Carv%'} 
            } 
        
  )


  /* 2. after define it with false... chaning it to defaultValue to true is
  not changing anything */
  // await queryInterface.changeColumn('company', 'job_scraper', {
  //         type: DataTypes.BOOLEAN,
  //         defaultValue : true, 
  //         allowNull: false
  // })

  /* 1. add column */
  // await queryInterface.addColumn('company', 'job_scraper', {
    
  //     type: DataTypes.BOOLEAN,
  //     defaultValue : true
  // });
}

async function down(queryInterface,DataTypes) {
  
}


