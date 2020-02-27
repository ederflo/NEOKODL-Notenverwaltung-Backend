'use strict';

const express = require('express');
const Sequelize = require('sequelize');
const bodyparser = require('body-parser');

const hostname = "localhost";
const port = "5000";
const sequelize = new Sequelize(`Notenverwaltung`, '', '', {
    host: 'localhost',
    port: 1433,
    dialect: 'mssql'
});

const app = express();
connectToDb();

async function connectToDb(){
    try {
        //connection aufbauen
        //await sequelize.authenticate();
        //console.log("Connection established");

        defaultSetup();
    } catch (err) {
        errorSetup(err);
    }
}

module.exports = app;

function defaultSetup(){
    const periodsRouter = require("./Periods/PeriodsRouter");
    const userRouter = require("./Users/UserRouter");

    app.use("/api/periods", periodsRouter);
    app.use("/api/users", userRouter);
    app.use(bodyparser.json());

    app.listen(port, hostname, () => {console.log("Express geht, Database geht")});
    app.get("/", (req, res) => {res.send("jo")});
}
function errorSetup(err){
    app.use('*', (req, res) => {res.status(500).send("An error occured.")});
    app.listen(port, hostname, () => {
        console.log("Express geht, Database geht nicht");
        console.error(err);
    });
}

