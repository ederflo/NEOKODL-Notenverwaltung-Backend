'use strict';
const AppError = require('../services/error-management').AppError;

module.exports = (sequelize, DataTypes) => {
  var Period = sequelize.define('Period', {
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [4, 20] }
    },
    from: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    till: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        fromBeforeTill: function (value) {
          if (new Date(this.from).getTime() >= new Date(this.till).getTime()) {
            throw new AppError(400, 'From must before till!');
          }
        }
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  });

  Period.associate = function (models) {
    models.Period.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Period;
};