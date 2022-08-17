'use strict';
const {
  Model
} = require('sequelize');

const {comapnyRecordsRestoreFromCSV} = require('../util/DBRecordsRestoreFromCSV/companyTable_RestoreFromCSV');
// const jobposting = require('./jobposting');
// const benefit = require('./benefit')

module.exports = (sequelize, DataTypes) => {
  class company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({jobposting, benefit}) {
      // define association here
      this.hasMany(jobposting, {
    
        foreignKey : "company_name",
        
      })
      this.hasMany(benefit, {
    
        foreignKey : "company_name",
        
      })
    }
    /**
     * company model classmethod : Seed the company table
     * 
     *  Warning: Accessing non-existent property 'splice' of module exports inside circular dependency
     *  To prevent cir. dependency, pass itself as a second argument to loc_lookupRecordsRestoreFromCSV()
     *  
     */
    static async seed(logger)
    {
      try{
        await comapnyRecordsRestoreFromCSV('company table_0629.csv', company, logger);
      }catch(e)
      {
        logger.error(`[jobposting classmethod]seed database error : ${e}`);
      }
    }

  }
  company.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique :true,
      // references : {
      //   model : jobposting,
      //   key : "company_name"
      // }
    },
    company_jobpage: DataTypes.TEXT,
    company_website: DataTypes.TEXT,
    industry: DataTypes.TEXT,
    imagelink: DataTypes.TEXT,
    company_summary: DataTypes.TEXT, 
    company_description: DataTypes.TEXT, 
    // benefit_details: DataTypes.TEXT, 
    // link_to_benefit_details: DataTypes.TEXT,  
   
    job_scraper: {
      type: DataTypes.BOOLEAN,
      defaultValue : true,
      allowNull: false
    },

    // Columns to categorize each company by benefits it offers
    // student_loan_repayment: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue : false,
    //   allowNull: false
    // },
    // full_tuition_coverage: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue : false,
    //   allowNull: false
    // },
    // tuition_assistance: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue : false,
    //   allowNull: false
    // },
    // tuition_reimbursement: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue : false,
    //   allowNull: false
    // },


  }, {
    sequelize,
    modelName: 'company',
    paranoid: true
  });
  return company;
};

