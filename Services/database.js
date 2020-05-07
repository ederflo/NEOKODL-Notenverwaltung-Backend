
const Sequelize = require('sequelize');
const configManager = require('./configManager');

const dbConfig = configManager.getDataBaseConfig();

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);

const connect = async () => {
    await sequelize.authenticate();
    Period.associate(database.models);
    OrganizationalUnit.associate(database.models);
    await sequelize.sync({ force: true });
};

const model = name => database.models[name];

const User = sequelize.import('./../users/UserModel');
const Period = sequelize.import('./../Periods/PeriodsModel');
const OrganizationalUnit = sequelize.import('./../organizationalUnits/OrganizationalUnitsModel');

const database = {
  sequelize: sequelize,
  models: { User, Period, OrganizationalUnit },
  connect,
  model
};

module.exports = database;