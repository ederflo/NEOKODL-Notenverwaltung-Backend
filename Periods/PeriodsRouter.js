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
PATCH   |   /toggleArchive/:id

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
    delete req.body.id;
    var period = req.body;
    Period.findAndCountAll({where: {active: true}})
        .then((seqObject) => {
            if(seqObject.count === 0){
                period.active = true;
            } else {
                if(period.active){
                    res.status(400).send('Cannot create another active period.');
                    return;
                }
            }
            if(period.archived === true){
                res.status(400).send('Cannot create archived period.');
                return;
            }
            Period.create(period)
                .then((createdPeriod) => {
                    res.status(201).json(createdPeriod);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send('Could not create period');
                });
        })
        .catch((err) => {
            res.send(500).send('Something broke.');
        })
});

router.put('/:id', selectById, validateCompletePeriod, doUpdate);

router.patch('/:id', selectById, validatePartialPeriod, doUpdate);

router.delete('/:id', selectById, (req, res) => {
    if(req.selectedPeriod.active){
        res.status(400).send('Cannot delete active period.');
        return;
    }
    req.selectedPeriod.destroy()
        .then(() => {
            res.status(200).send('Period deleted');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Something went wrong');
        });
});

router.patch('/activate/:id', selectById, (req, res) => {
    if(req.selectedPeriod.archived === true){
        res.status(400).send('Cannot activate an archived period.');
    } else {
        Period.findOne({ where: { active: true } })
        .then(previouslyActivePeriod => {
            if(req.selectedPeriod.id == previouslyActivePeriod.id){
                res.status(400).send('Period is already active.');
                return;
            }
            previouslyActivePeriod.update({active: false});

            req.selectedPeriod.update({active: true})
                .then((activatedPeriod) => {
                    res.status(200).json(activatedPeriod);
                })
                .catch((err) => {
                    res.status(500).send('Something went wrong. Cannot change active period.');
                    console.log(err);
                    previouslyActivePeriod.update({active: true});
                })
        })
        .catch((err) => {
            res.status(500).send('Something went wrong.');
            console.error(err);
        })
    }
});

router.patch('/toggleArchive/:id', selectById, (req, res) => {
    if (req.selectedPeriod.active) {
        res.status(500).send('Cannot archive an active period.');
    } else {
        let needsToBeArchived = false;
        if(!req.selectedPeriod.archived){
            needsToBeArchived = true;
        }
        req.selectedPeriod.update({archived: needsToBeArchived})
            .then((period) => {
                res.status(200).json(period);
            })
            .catch((err) => {
                res.status(500).send('Something went wrong');
                console.error(err);
            });
    }
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

    let user = req.body.user;
    delete comparePeriod.id;
    delete comparePeriod.createdAt;
    delete comparePeriod.updatedAt;
    delete req.body.user;

    if (fullUpdate) {
        if (Object.keys(comparePeriod).length != Object.keys(req.body).length) {
            res.status(400).send('number o properties in object not valid');
            return;
        }
    }

    if(comparePeriod.active != req.body.active){
        res.status(400).send('Cannot set field: active of period on this route.');
        return;
    }

    if(comparePeriod.archived != req.body.archived){
        res.status(400).send('Cannot set field: archived of period on this route.');
        return;
    }

    if (Object.keys(req.body).some(k => { return comparePeriod[k] == undefined; })) {
        res.status(400).send('properties of object do not match');
        return;
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
            console.error(err);
            res.status(500).send('Something went wrong');
        });
}
module.exports = router;