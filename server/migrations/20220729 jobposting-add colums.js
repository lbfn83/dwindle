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
    // This column can't set the foreign key from loc_lookup table 
    // as it doesn't have unique constraint
    
    // Raw query with queryInterface()
    // cf)
    // await queryInterface.addColumn('jobposting', 'std_loc_str', {
    //   type: DataTypes.TEXT
    // });
    // https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-add-column/
    const result = await queryInterface.sequelize.query(`ALTER TABLE jobposting ADD COLUMN IF NOT EXISTS std_loc_str TEXT;`);
    console.log(result)

    // Before setting NOT null constraints insert dummy init value
    const result2 = await queryInterface.sequelize.query(`Update jobposting SET std_loc_str = 'init' ;`);
    console.log(result2)

    // https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-not-null-constraint/
    // Adding NOT NULL Constraint to existing columns
    // In alter column can't use 'If exists'
    // https://www.postgresql.org/docs/current/sql-altertable.html
    const result3 = await queryInterface.sequelize.query(`ALTER TABLE jobposting ALTER COLUMN std_loc_str SET NOT NULL ;`);
    console.log(result3)

  }catch(e)
  {
    console.log(e)
  }

}

async function down(queryInterface,DataTypes) {
  
}


