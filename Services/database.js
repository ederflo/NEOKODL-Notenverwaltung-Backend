
const Sequelize = require('sequelize');
const configManager = require('./configManager');

const dbConfig = configManager.getDataBaseConfig();

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);

const connect = async () => {
  try {
    await sequelize.authenticate();
    Period.associate(database.models);
    await sequelize.sync({ force: true });

    console.log('Connection to the database has been established successfully.');
  }
  catch (error) {
    console.error(error);
  }
};

const model = name => database.models[name];

const User = sequelize.import('./../Users/UserModel');
const Period = sequelize.import('./../Periods/PeriodsModel');

const database = {
  sequelize: sequelize,
  models: { User, Period },
  connect,
  model
};

module.exports = database;