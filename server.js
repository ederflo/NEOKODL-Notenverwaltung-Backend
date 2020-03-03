'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const Sequelize = require('sequelize');

const fs = require('fs');

const wsConfigFilePath = "./Configs/webserverConfig.json";
const dbConfigFilePath = './Configs/dbConfig.json';

const dbConfig = JSON.parse(fs.readFileSync(dbConfigFilePath));
const wsConfig = JSON.parse(fs.readFileSync(wsConfigFilePath));

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, dbConfig.options);

const app = express();
connectToDb();

async function connectToDb(){
    try {
        //connection aufbauen
        await sequelize.authenticate();

        defaultSetup();
    } catch (err) {
        errorSetup(err);
    }
}

function defaultSetup(){
    app.use(bodyparser.json());
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