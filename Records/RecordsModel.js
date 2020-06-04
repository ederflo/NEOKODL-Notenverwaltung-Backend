'use strict';

module.exports = (sequelize, DataTypes) => {
    const Records = sequelize.define('Record', {
        value : {
            type: DataTypes.STRING,
            allowNull: false
        },
        evaluatedOn: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: true
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        createdOn: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        modifiedOn: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    });

    Records.associate = function(models) {
        models.Record.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        })
        models.Record.belongsTo(models.Pupil, {
            foreignKey: {
                allowNull: false
            }
        });
        models.Record.belongsTo(models.OrganizationalUnit, {
            foreignKey: {
                allowNull: false
            }
        });
    }
    return Records;
}