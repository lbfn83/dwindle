'use strict';
const {
  Model
} = require('sequelize');
// const company = require('./company');
module.exports = (sequelize, DataTypes) => {
  // console.log("sequelize" ,sequelize)
  // console.log("company", company)
  class jobposting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({company}) {
      // define association here
      this.belongsTo(company, {

         targetKey : "companyname",
         foreignKey : "company_name",
        //  as : 'Asjobposting'
      })
    }
  }
  
  jobposting.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    linkedin_job_url_cleaned: {
      type : DataTypes.TEXT,
      primaryKey: true
    },
    company_name: {
      type: DataTypes.STRING
    },
    normalized_company_name: DataTypes.STRING,
    job_title: DataTypes.TEXT,
    job_location: DataTypes.STRING,
// Should make this column to only accept either of USA or CANADA
    normalized_job_location : {
      type: DataTypes.ENUM,
      values : ['USA', 'CANADA'],
      allowNull : false
    },
    posted_date: DataTypes.STRING,
    full_text: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'jobposting',
    paranoid: true
  });
  return jobposting;
};