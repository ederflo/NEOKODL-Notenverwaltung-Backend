'use strict';
module.exports = (sequelize, DataTypes) => {
    var Period = sequelize.define('Period', {
      label: DataTypes.STRING,
      from: DataTypes.DATE,
      till: DataTypes.DATE,
      active: DataTypes.BOOLEAN
    });
  
    Period.associate = function(models) {
      models.Period.hasMany(models.Task);
    };
  
    return Period;
  };