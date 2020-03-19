'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const db = require('./Services/database');

const fs = require('fs');

const wsConfigFilePath = './Configs/webserverConfig.json';
const wsConfig = JSON.parse(fs.readFileSync(wsConfigFilePath));

const app = express();
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

    app.use(bodyparser.json());
    app.post('/api/v1/auth/login', authController.login);
    app.use(authController.verifyToken);
    app.use('/api/v1/periods', periodsRouter);
    app.use('/api/v1/users', userRouter);
    app.get('/', (req, res) => {res.send('Express is up and running.')});

    app.get('/secret', (req, res) => {res.send('Secret site')});

    app.listen(wsConfig.port, wsConfig.hostname, () => {console.log(`Express is up and running on ${wsConfig.hostname}:${wsConfig.port}`)});
}
function errorSetup(err){
    app.use('*', (req, res) => {res.status(500).send('This page is currently unavaliable. Please try it later again!')});
    app.listen(wsConfig.port, wsConfig.hostname, () => {
        console.error('Server is up and running but an error occured: ' + err);
    });
}

module.exports = app;