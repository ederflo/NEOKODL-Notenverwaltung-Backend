'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const db = require('./Services/database');

const fs = require('fs');

const wsConfigFilePath = "./Configs/webserverConfig.json";
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
    const periodsRouter = require("./Periods/PeriodsRouter");
    const userRouter = require("./Users/UserRouter");

    app.use(bodyparser.json());
    app.use("/api/periods", periodsRouter);
    app.use("/api/users", userRouter);
    app.get("/", (req, res) => {res.send('Express is up and running.')});

    app.listen(wsConfig.port, wsConfig.hostname, () => {console.log(`Express is up and running on ${wsConfig.hostname}:${wsConfig.port}`)});
    console.log('Successfully connected to database.')
}
function errorSetup(err){
    app.use('*', (req, res) => {res.status(500).send('This page is currently unavaliable. Please try it later again!')});
    app.listen(wsConfig.port, wsConfig.hostname, () => {
        console.error('Server is up and running but an error occured: ' + err);
    });
}

module.exports = app;