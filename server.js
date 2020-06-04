'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const configManager = require('./Services/configManager');
var db;

const app = express();
let configPath;
if (process.argv[2] == './test/test.js') configPath = process.argv[3];
else configPath = process.argv[2];

try {
    if (configPath)
        configPath = './../configs/' + configPath + ".json";
    console.error(process.argv[0]);
    configManager.loadConfig(configPath);
} catch (err) {
    console.error('Cannot load config file: ' + configPath + '! Server is using default config file!');
    console.error(err);
}
connectToDb();

async function connectToDb() {
    try {
        db = require('./Services/database');
        await db.connect(configManager.getDataBaseConfig());
        console.log('Connection to the database has been established successfully.');
        defaultSetup();
    } catch (err) {
        errorSetup(err);
    }
}

function defaultSetup() {
    const userRouter = require('./users/UserRouter');
    const periodsRouter = require('./Periods/PeriodsRouter');
    const authController = require('./Authentication/AuthenticationController');
    const organizationalUnitsRouter = require('./organizationalUnits/OrganizationalUnitsRouter');
    const pupilsRouter = require('./Pupils/PupilsRouter');
    const recordsRouter = require('./Records/RecordsRouter');
    const errorManager = require('./Services/error-management').errorHandler;

    const corsOptions = configManager.getCorsData();

    app.use(bodyparser.json());
    app.use(cors(corsOptions));
    app.post('/api/v1/auth/login', authController.login);
    app.use('/api/v1/users', userRouter);
    app.get('/', (req, res) => { res.send('Express is up and running.') });
    app.use(authController.verifyToken);
    app.use('/api/v1/periods', periodsRouter);
    app.use('/api/v1/ou', organizationalUnitsRouter);
    app.use('/api/v1/pupils', pupilsRouter);
    app.use('/api/v1/records', recordsRouter);
    app.get('/secret', (req, res) => { res.status(200).send('Secret site') });

    const backendConfig = configManager.getBackendData();

    app.listen(backendConfig.port, backendConfig.hostname, () => {
        console.log(`Express is up and running on ${backendConfig.hostname}:${backendConfig.port}`)
        app.emit("app_started");
    });
    app.use(function (err, req, res, next) {
        errorManager(err, req, res, next);
    });
}
function errorSetup(err) {
    try {
        const backendConfig = configManager.getBackendData();
        app.use('*', (req, res) => { res.status(500).send('This page is currently unavaliable. Please try it later again!') });
        app.listen(backendConfig.port, backendConfig.hostname, () => {
            console.error('Server is up and running but an error occured: ' + err);
            console.error(err.stack);
        });
    } catch(error) {
        console.error(error);
    }
}

module.exports = app;