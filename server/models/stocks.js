
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Stocks extends Model {
  };
  Stocks.init({
    product_id: DataTypes.INTEGER,
    room: DataTypes.INTEGER,
    warehouse: DataTypes.INTEGER,
    critical_stock: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'Stocks',
    underscored: true,
  });
  return Stocks;
};


