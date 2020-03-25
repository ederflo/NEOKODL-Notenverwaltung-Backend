'use strict';
module.exports = (sequelize, DataTypes) => {
    var Period = sequelize.define('Period', {
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {len: [4, 20]}
      },
      from: {
        type: DataTypes.DATE,
        allowNull: false
      },
      till: {
        type: DataTypes.DATE,
        allowNull: false
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
  
    Period.associate = function(models) {
      models.Period.hasMany(models.Task);
    };
  
    return Period;
  };