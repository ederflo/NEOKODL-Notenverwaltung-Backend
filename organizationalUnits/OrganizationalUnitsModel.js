'use strict';

module.exports = (sequelize, DataTypes) => {
  var OrganizationalUnit = sequelize.define('OrganizationalUnit', {
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 32] }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [0, 256] }
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['label', 'PeriodId']
      }
    ]
  });

  OrganizationalUnit.associate = function (models) {
    models.OrganizationalUnit.belongsTo(models.Period, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return OrganizationalUnit;
};