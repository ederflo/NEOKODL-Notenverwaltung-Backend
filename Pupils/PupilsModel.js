const AppError = require('../Services/error-management').AppError;

module.exports = (sequelize, DataTypes) => {
    const Pupils = sequelize.define('Pupil', {
        username : {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
            unique: true,
            validate: { 
                isEmail: true
            }
        }
    });
    Pupils.associate = function (models) {
        models.Pupil.belongsTo(models.User, {
          foreignKey: {
            allowNull: false
          }
        });
    };
    return Pupils;
}