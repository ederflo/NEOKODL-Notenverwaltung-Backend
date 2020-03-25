'use strict';
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { len: [4, 50]}
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [4, 50]}
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        instanceMethods: {
          validPassword: async function (password) {
            return await bcrypt.compare(password, this.password)
          }
        }
    });

    User.associate = function(models) {
        models.User.hasMany(models.Task);
    };

    function generateHash(user) {
        if (user === null) {
            throw new Error('No user given!');
        }
        else if (!user.changed('password')) 
            return user.password;
        else {
            let salt = bcrypt.genSaltSync();
            return user.password = bcrypt.hashSync(user.password, salt);
        }
    }
    User.beforeCreate(generateHash);
    User.beforeUpdate(generateHash);

    return User;
};