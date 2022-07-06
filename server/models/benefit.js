'use strict';
const {
  Model
} = require('sequelize');
// const company = require('./company');
module.exports = (sequelize, DataTypes) => {
  // console.log("sequelize" ,sequelize)
  // console.log("company", company)
  class benefit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({company}) {
      // define association here
      this.belongsTo(company, {

         targetKey : "company_name",
         foreignKey : "company_name",
        //  as : 'Asjobposting'
      })
    }
    
  }
  
  benefit.init({
    uuid: {
        // primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    }, 
    company_name: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    benefit_type : {
        type: DataTypes.ENUM,
        values : [
          'student_loan_repayment',
          'tuition_assistance',
          'tuition_reimbursement',
          'full_tuition_coverage',
        ],
        primaryKey : true,
        allowNull : false
    },
    benefit_details: {
        type: DataTypes.TEXT
    },
    link_to_benefit_details: {
        type: DataTypes.TEXT
    },


    }, {
    sequelize,
    modelName: 'benefit',
    paranoid: true
  });
  return benefit;
};