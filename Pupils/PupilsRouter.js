const express = require('express');
const router = express.Router();
const db = require('../Services/database');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;

router.get('/', (req, res) => {
    res.status(200).json([{"id":"1","email":"exampleMail@mail.com","birthdt":"2020-04-27","firstname":"Karli","lastname":"Kolumbus","notes":"Wofür is dieses Feld eigentlich do?"},{"id":"2","email":"exampleNail@nail.com","birthdt":"2020-04-27","firstname":"Karlo","lastname":"Astro","notes":"Die Frage bleibt bestehen."},{"id":"3","email":"exampleXail@xail.com","birthdt":"2020-04-27","firstname":"Karle","lastname":"Kolumbe","notes":"Die Frage."}]);
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(req.selectedPupil);
});

router.post('/', (req, res) => {
    delete req.body.id;
    var pupil = req.body;
    res.status(201).json(pupil);
});

router.delete('/:id', selectById, (req, res) => {
    res.status(204).send();
});

function selectById(req, res, next) {
    let reqId = parseInt(req.params.id);
    if (isNaN(reqId)) {
        throw new AppError(400, 'Given id was not a number.');
    }
    if (reqId != 1) {
        err.statusCode = 404;
        handleError(err, req, res);
        return;
    }
    req.selectedPupil = { 
        id: 1, 
        email: 'exampleMail@mail.com', 
        birthdt: '27.04.2020',
        firstname: "Karli",
        lastname: "Kolumbus",
        notes: "Wofür is dieses Feld eigentlich do?"
    };
    next();
}

module.exports = router;