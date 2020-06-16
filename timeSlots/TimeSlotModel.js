'use strict';
const AppError = require('../Services/error-management').AppError;

module.exports = (sequelize, DataTypes) => {
  var TimeSlot = sequelize.define('TimeSlot', {
    weekday: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Weekday must be between 1-7!'
        },
        max: {
          args: [7],
          msg: 'Weekday must be between 1-7!'
        }
      }
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