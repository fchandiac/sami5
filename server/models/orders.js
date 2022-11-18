'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
  };
  Orders.init({
    state: DataTypes.BOOLEAN,
    // delivery: DataTypes.BOOLEAN,
    // table: DataTypes.INTEGER,
  
  }, {
    sequelize,
    modelName: 'orders',
    underscored: true,
  });
  return Orders;
};