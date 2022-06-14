'use strict';
const {
  Model
} = require('sequelize');
const jobposting = require('./jobposting');

module.exports = (sequelize, DataTypes) => {
  class company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({jobposting}) {
      // define association here
      this.hasMany(jobposting, {
    
        foreignKey : "company_name",
        
      })
    }
  }
  company.init({
    // uuid: {
    //   type: DataTypes.UUID,
    //   defaultValue: DataTypes.UUIDV4,
    // },
    companyname: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique :true,
      references : {
        model : jobposting,
        key : "company_name"
      }
    },
    // test: DataTypes.STRING,
    description: DataTypes.TEXT,
    // benefits: DataTypes.TEXT, 
 
    
    benefitsubtitle1: DataTypes.STRING,
    benefitsubtitle2: DataTypes.STRING,
    benefitdesc1: DataTypes.STRING,
    benefitdesc2: DataTypes.STRING,
    // job_scraper: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue : true,
    //   allowNull: false
    // }
    // test: DataTypes.STRING
    
  }, {
    sequelize,
    modelName: 'company',
    paranoid: false
  });
  return company;
};

