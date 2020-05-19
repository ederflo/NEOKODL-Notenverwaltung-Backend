'use strict';
const AppError = require('../Services/error-management').AppError;

module.exports = (sequelize, DataTypes) => {
  var TimeSlot = sequelize.define('TimeSlot', {
    weekday: {
      type: DataTypes.INTEGER,
      allowNull: false,
      min: 1,
      max: 7
    },
    from: {
      type: DataTypes.TIME,
      allowNull: false
    },
    till: {
      type: DataTypes.TIME,
      allowNull: false
    }
  });

  TimeSlot.associate = function (models) {
    models.TimeSlot.belongsTo(models.OrganizationalUnit, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return TimeSlot;
};