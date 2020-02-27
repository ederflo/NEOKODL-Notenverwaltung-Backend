'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const Sequelize = require('sequelize');

const hostname = 'neokodl';
const port = '8080';
const sequelize = new Sequelize('Neokodl', 'root', 'root', {
    host: hostname,
    dialect: 'mssql'
});

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
    app.use('*', (req, res) => {res.status(500).send('An error occured.')});
    app.listen(port, hostname, () => {
        console.error('An error occured: ' + err);
    });
}