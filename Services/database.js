
const Sequelize = require('sequelize');
const configManager = require('./configManager');

const dbConfig = configManager.getDataBaseConfig();

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);

const connect = async () => {
    await sequelize.authenticate();
    Period.associate(database.models);
    A_OUPupil.associate(database.models);
    Pupil.associate(database.models);
    OrganizationalUnit.associate(database.models);
    Evaluation.associate(database.models);
    await sequelize.sync({ force: true });
};

const model = name => database.models[name];

const User = sequelize.import('./../users/UserModel');
const Period = sequelize.import('./../Periods/PeriodsModel');
const Pupil = sequelize.import('./../Pupils/PupilsModel');
const OrganizationalUnit = sequelize.import('./../organizationalUnits/OrganizationalUnitsModel');
const A_OUPupil = sequelize.import('./../Associations/PupilOUAssociation');
const Evaluation = sequelize.import('./../Evaluations/EvaluationsModel');

const database = {
  sequelize: sequelize,
  models: { User, Period, OrganizationalUnit, Pupil, A_OUPupil, Evaluation },
  connect,
  model
};

module.exports = database;