'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const db = require('./Services/database');
const cors = require('cors');
const configManager = require('./Services/configManager');

const app = express();
let configPath = process.argv[2];

try {
    if (configPath)
            configPath = './../configs/' + configPath + ".json";
    configManager.loadConfig(configPath);
} catch (err) {
    console.error('Cannot load config file: ' + configPath + '! Server is using default config file!');
    console.error(err);
}
connectToDb();

async function connectToDb(){
    try {
        await db.connect();
        defaultSetup();
    } catch (err) {
        errorSetup(err);
    }
}

function defaultSetup(){
    const periodsRouter = require('./Periods/PeriodsRouter');
    const userRouter = require('./Users/UserRouter');
    const authController = require('./Authentication/AuthenticationController');

    const corsOptions = configManager.getCorsData();

    app.use(bodyparser.json());
    app.use(cors(corsOptions));
    app.post('/api/v1/auth/login', authController.login);
    app.use('/api/v1/users', userRouter);
    app.get('/', (req, res) => {res.send('Express is up and running.')});
    app.use(authController.verifyToken);
    app.use('/api/v1/periods', periodsRouter);
    app.get('/secret', (req, res) => {res.send('Secret site')});

    const backendConfig = configManager.getBackendData();

    app.listen(backendConfig.port, backendConfig.hostname, () => {
        console.log(`Express is up and running on ${backendConfig.hostname}:${backendConfig.port}`)
        
    });
}
function errorSetup(err){
    app.use('*', (req, res) => {res.status(500).send('This page is currently unavaliable. Please try it later again!')});
    app.listen(backendConfig.port, backendConfig.hostname, () => {
        console.error('Server is up and running but an error occured: ' + err);
    });
}

module.exports = app;