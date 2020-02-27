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

router.get('/', notImplemented);
router.get('/:id', notImplemented);
router.post('/', notImplemented);
router.put('/:id', notImplemented);
router.patch('/:id', notImplemented);
router.delete('/:id', notImplemented);

module.exports = router;

function notImplemented(req, res) {
    res.status(501).send(`Sog dem Dome er soll endlich ${req.method} implementieren!`);
}