
const Sequelize = require('sequelize');
const configManager = require('./configManager');

const dbConfig = configManager.getDataBaseConfig();

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);

const connect = async () => {
    await sequelize.authenticate();
    Period.associate(database.models);
    Pupil.associate(database.models);
    await sequelize.sync({ force: true }); //
};

const model = name => database.models[name];

const User = sequelize.import('./../Users/UserModel');
const Period = sequelize.import('./../Periods/PeriodsModel');
const OU = sequelize.import('./../organizationalUnits/OrganizationalUnitsModel');
const Pupil = sequelize.import('./../Pupils/PupilsModel');


const database = {
  sequelize: sequelize,
  models: { User, Period, OU, Pupil },
  connect,
  model
};

module.exports = database;