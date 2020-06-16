'use strict';

module.exports = (sequelize, DataTypes) => {
    const Evaluations = sequelize.define('Evaluation', {
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

    Evaluations.associate = function(models) {
        models.Evaluation.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        })
        models.Evaluation.belongsTo(models.Pupil, {
            foreignKey: {
                allowNull: false
            }
        });
        models.Evaluation.belongsTo(models.OrganizationalUnit, {
            foreignKey: {
                allowNull: false
            }
        });
    }
    return Evaluations;
}