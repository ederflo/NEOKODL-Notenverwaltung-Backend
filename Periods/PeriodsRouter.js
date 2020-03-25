/*

HTTP Endpoints for the period - REST API

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
const db = require('../Services/database');
const Period = db.model('Period');

router.get('/', (req, res) => {
    Period.findAll()
        .then((periods) => {
            res.status(200).json(periods);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Something went wrong');
    });
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(req.selectedPeriod);
});

router.post('/', (req, res) => {
    Period.create(req.body)
        .then((period) => {
            res.status(201).json(period);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Could not create period');
    });
});

router.put('/:id', selectById, validateCompletePeriod, doUpdate);

router.patch('/:id', selectById, validatePartialPeriod, doUpdate);

router.delete('/:id', selectById, (req, res) => {
    req.selectedPeriod.destroy()
        .then(() => {
            res.status(200).send('Period deleted');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Something went wrong');
    });
});

function selectById(req, res, next) {
    Period.findOne({ where: { id: req.params.id } })
        .then(period => {
            if (period == null) {
                res.status(404).send('Not found');
                return;
            }
            req.selectedPeriod = period;
            next();
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Something went wrong');
            return;
    });
}
function validateCompletePeriod(req, res, next) {
    validatePeriodObjectForUpdate(req, res, next, true);
}
function validatePartialPeriod(req, res, next) {
    validatePeriodObjectForUpdate(req, res, next, false);
}
function validatePeriodObjectForUpdate(req, res, next, fullUpdate) {
    let comparePeriod = req.selectedPeriod.toJSON();

    delete comparePeriod.createdAt;
    delete comparePeriod.updatedAt;

    if (fullUpdate) {
        if (Object.keys(comparePeriod).length != Object.keys(req.body).length) {
            res.status(400).send('number o properties in object not valid');
            return;
        }
    }

    if (Object.keys(req.body).some(k => { return comparePeriod[k] == undefined; })) {
        res.status(400).send('properties of object do not match');
        return;
    }

    next();
}
function doUpdate(req, res) {
    req.selectedPeriod.update(req.body)
        .then((period) => {
            res.status(200).json(period);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Something went wrong');
    });
}
module.exports = router;