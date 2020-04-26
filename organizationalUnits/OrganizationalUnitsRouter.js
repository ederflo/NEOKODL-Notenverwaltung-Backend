const express = require('express');
const router = express.Router();
const db = require('../Services/database');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;

router.get('/', (req, res) => {
            res.status(200).json(
                `[
                    {
                        "id": 1,
                        "label": "4BHIF SYP",
                        "discription": "Ganze Klasse"
                    },
                    {
                        "id": 2,
                        "label": "2AHTT AM",
                        "discription": "Mathematik de scheiß Baukinder"
                    },
                    {
                        "id": 3,
                        "label": "4BHIF English",
                        "discription": "HAHAHAHAHA"
                    },
                    {
                        "id": 4,
                        "label": "4BHIF POS G1",
                        "discription": "Gruppe 1 von 4BHIF"
                    }
                    
                ]`
            );
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(req.selectedOrganizationalUnit);
});

router.post('/', (req, res) => {
    delete req.body.id;
    var organizationalUnit = req.body;
    res.status(201).json(organizationalUnit);
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
    req.selectedOrganizationalUnit = { id: 1, label: '4BHIF SYP', description: 'Ganze Klasse'}
}