const AppError = require('../services/error-management').AppError;

module.exports = (sequelize, DataTypes) => {
    const Pupils = sequelize.define('Pupil', {
        username : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [4, 12]
            }
        },
        birthdt : {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        firstname : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [2, 50] }
        },
        lastname : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [2, 50] }
        },
        mail : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                isEmail: true
            }
        }
    },{
        indexes: [
            {
                unique: true,
                fields: ['username', 'UserId']
            },
            {
                unique: true,
                fields: ['mail', 'UserId']
            }
        ]
    });
    Pupils.associate = function (models) {
        models.Pupil.belongsTo(models.User, {
          foreignKey: {
            allowNull: false
          }
        });
        models.Pupil.belongsToMany(models.OrganizationalUnit, {
            through: models.A_OUPupil,
            foreignKey: 'PupilId'
        });
    };
    return Pupils;
}