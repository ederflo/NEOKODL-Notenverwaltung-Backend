'use strict';

const express = require('express');
const bodyparser = require('body-parser');

const hostname = "neokodl.app";
const port = "8080";

const app = express();
connectToDb();

async function connectToDb(){
    try {
        //connection aufbauen

        defaultSetup();
    } catch (err) {
        errorSetup(err);
    }
}

function defaultSetup(){
    app.use(bodyparser.json());
    app.get("/", (req, res) => {res.send("Express is up and running.")});

    app.listen(port, hostname, () => {console.log(`Express is up and running on ${hostname}:${port}`)});
}
function errorSetup(err){
    app.use('*', (req, res) => {res.status(500).send("An error occured.")});
    app.listen(port, hostname, () => {
        console.error("An error occured: " + err);
    });
}