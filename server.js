'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const Sequelize = require('sequelize');

const fs = require('fs');

const hostname = 'neokodl';
const port = '8080';
const dbConfigFilePath = './Configs/dbConfig.json';

const dbConfig = JSON.parse(fs.readFileSync(dbConfigFilePath));

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

    app.listen(port, hostname, () => {console.log(`Express is up and running on ${hostname}:${port}`)});
    console.log('Successfully connected to database.')
}
function errorSetup(err){
    app.use('*', (req, res) => {res.status(500).send('This page is currently unavaliable. Please try it later again!')});
    app.listen(port, hostname, () => {
        console.error('Server is up and running but an error occured: ' + err);
    });
}