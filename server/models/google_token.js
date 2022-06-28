'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class google_token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  google_token.init({
    token_chunk: {
      type: DataTypes.TEXT,
      primaryKey: true, 
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT, 
      allowNull: false
    },

  }, {
    sequelize,
    modelName: 'google_token',
  });
  return google_token;
};