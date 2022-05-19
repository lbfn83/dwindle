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

    companyname: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique :true,
      // references : {
      //   model : jobposting,
      //   key : "company_name"
      // }
    },
    // test: DataTypes.STRING,
    description: DataTypes.TEXT,
    benefits: DataTypes.TEXT, 
    // test: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'company',
    paranoid: true
  });
  return company;
};

