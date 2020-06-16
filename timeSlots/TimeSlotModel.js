'use strict';
const AppError = require('../Services/error-management').AppError;

module.exports = (sequelize, DataTypes) => {
  var TimeSlot = sequelize.define('TimeSlot', {
    weekday: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Weekday must be between 0-6!'
        },
        max: {
          args: [6],
          msg: 'Weekday must be between 0-6!'
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