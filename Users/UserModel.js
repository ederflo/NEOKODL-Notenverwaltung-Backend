'use strrict';
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        password: DataTypes.DATE,
        active: DataTypes.BOOLEAN
    });

    User.associate = function(models) {
        models.User.hasMany(models.Task);
    };

    return User;
};