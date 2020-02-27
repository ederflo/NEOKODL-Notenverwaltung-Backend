/*

HTTP Endpoints for the user - REST API

Method  |   url

GET     |   /
GET     |   /:id
POST    |   /
PUT     |   /:id
PATCH   |   /:id
DELETE  |   /:id

*/

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(501).send("Not implemented");
});

router.get('/:id', (req, res) => {
    res.status(501).send("Not implemented");
});

router.post('/', (req, res) => {
    res.status(501).send("Not implemented");
});

router.put('/:id', (req, res) => {
    res.status(501).send("Not implemented");
});

router.patch('/:id', (req, res) => {
    res.status(501).send("Not implemented");
});

router.delete('/:id', (req, res) => {
    res.status(501).send("Not implemented");
});

module.exports = router;