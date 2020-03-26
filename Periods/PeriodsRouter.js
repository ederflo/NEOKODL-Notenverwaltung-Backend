/*

HTTP Endpoints for the period - REST API

Method  |   url

GET     |   /
GET     |   /:id
POST    |   /
PUT     |   /:id
PATCH   |   /:id
DELETE  |   /:id
PATCH   |   /activate/:id

*/

const express = require('express');
const router = express.Router();
const db = require('../Services/database');
const Period = db.model('Period');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;

router.get('/', (req, res) => {
    Period.findAll({ where: { UserId: req.authUser.id } })
        .then((periods) => {
            res.status(200).json(periods);
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(req.selectedPeriod);
});

router.post('/', (req, res) => {
    delete req.body.id;
    var period = req.body;
    period.UserId = req.authUser.id;
    Period.findAndCountAll({ where: { active: true, UserId: req.authUser.id } })
        .then((seqObject) => {
            if (seqObject.count === 0) {
                period.active = true;
            } else {
                if (period.active) {
                    throw new AppError(400, 'Cannot create another active period.');
                } else if (period.active == null) {
                    period.active = false;
                }
            }
            if (period.archived == true) {
                throw new AppError(400, 'Cannot create archived period.');
            } else if (period.archived == null) {
                period.archived = false;
            }
            Period.create(period)
                .then((createdPeriod) => {
                    res.status(201).json(createdPeriod);
                })
                .catch((err) => {
                    err.statusCode = 400;
                    handleError(err, req, res);
                });
        })
        .catch((err) => {
            err.statusCode = 400;
            handleError(err, req, res);
        })
});

router.put('/:id', selectById, validateCompletePeriod, doUpdate);

router.patch('/:id', selectById, validatePartialPeriod, doUpdate);

router.delete('/:id', selectById, (req, res) => {
    if (req.selectedPeriod.active) {
        throw new AppError(400, 'Cannot delete active period.');
    }
    req.selectedPeriod.destroy()
        .then(() => {
            res.status(200).send('Period deleted');
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

router.patch('/activate/:id', selectById, (req, res) => {
    if (req.selectedPeriod.archived === true) {
        throw new AppError(400, 'Cannot activate an archived period.');
    } else {
        Period.findOne({ where: { active: true } })
            .then(previouslyActivePeriod => {
                if (req.selectedPeriod.id == previouslyActivePeriod.id) {
                    throw new AppError(400, 'Period is already active.');
                }
                previouslyActivePeriod.update({ active: false });

                req.selectedPeriod.update({ active: true })
                    .then((activatedPeriod) => {
                        res.status(200).json(activatedPeriod);
                    })
                    .catch((err) => {
                        err.statusCode = 500;
                        err.userMessage = 'Something went wrong. Cannot change active period.';
                        handleError(err, req, res);
                        previouslyActivePeriod.update({ active: true });
                    })
            })
            .catch((err) => {
                err.statusCode = 500;
                handleError(err, req, res);
            })
    }
});

function selectById(req, res, next) {
    let reqId = parseInt(req.params.id);
    if (isNaN(reqId)) {
        throw new AppError(400, 'Given id was not a number.');
    }
    Period.findOne({ where: { id: reqId, UserId: req.authUser.id } })
        .then(period => {
            if (period == null) {
                throw new AppError(404, 'Not found');
            }
            req.selectedPeriod = period;
            next();
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
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

    let user = req.body.user;
    req.body.UserId = req.authUser.id;
    delete comparePeriod.id;
    delete comparePeriod.createdAt;
    delete comparePeriod.updatedAt;
    delete req.body.user;

    if (fullUpdate) {
        if (Object.keys(comparePeriod).length != Object.keys(req.body).length) {
            throw new AppError(400, 'number o properties in object not valid');
        }
    }

    if (Object.keys(req.body).some(k => { return comparePeriod[k] == undefined; })) {
        throw new AppError(400, 'properties of object do not match');
    }

    if (req.body.active != undefined) {
        if (comparePeriod.active != req.body.active) {
            throw new AppError(400, 'Cannot set field: active of period on this route.');
        }
    }
    if (req.body.archived != undefined) {
        if (comparePeriod.archived != req.body.archived) {
            if (req.selectedPeriod.active) {
                throw new AppError(400, 'Cannot archive an active period.');
            }
        }
    }

    req.body.user = user;
    next();
}
function doUpdate(req, res) {
    req.selectedPeriod.update(req.body)
        .then((period) => {
            res.status(200).json(period);
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
}
module.exports = router;