const express = require('express');
const router = express.Router();
const db = require('../Services/database');
const Evaluation = db.model('Evaluation');
const Pupil = db.model('Pupil');
const Period = db.model('Period');
const OU = db.model('OrganizationalUnit');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;
const outputFormatter = require('../Services/outPutFormatter');

//get period based

/*
    [
        OU1Label : [
            {Pupil: PupilObject, doublets: doubletEvaluations},
            {Pupil: PupilObject, doublets: doubletEvaluations}
        ],
        OU2Label : [
            {Pupil: PupilObject, doublets: doubletEvaluations},
            {Pupil: PupilObject, doublets: doubletEvaluations}
        ]
    ]
*/

/*
    [
        OU1Label : [
            {Pupil: PupilObject, doublets: doubletEvaluations},
            {Pupil: PupilObject, doublets: doubletEvaluations}
        ],
        OU2Label : [
            {Pupil: PupilObject, doublets: doubletEvaluations},
            {Pupil: PupilObject, doublets: doubletEvaluations}
        ],
        {
            OU3Label: {
                "username": [
                    {
                        pupil: PupilObject,
                        doublets: [
                            {evaluation1, evaluation2}
                        ]
                    }
                ]
            }
        }
    ]
*/

router.get('/findDoublets', async (req, res) => {
    let returnValues = [];

    try {
        let allEvals = await Evaluation.findAll({ where: { UserId: req.authUser.id } });
        for (let eva of allEvals) {
            for (let eva2 of allEvals) {
                if (eva.id !== eva2.id && eva.PupilId === eva2.PupilId && eva.OrganizationalUnitId === eva2.OrganizationalUnitId) {
                    if (eva.evaulautedOn === eva2.evaulautedOn && eva.value === eva2.value) {
                        let pupil = await Pupil.findOne({ where: { id: eva.PupilId } });
                        let ou = await OU.findOne({ where: { id: eva.OrganizationalUnitId } });
                        let pupilUsername = pupil.username;

                        let ouToAddTo = returnValues[ou.label];
                        if(ouToAddTo){
                            let pupilToAddTo = ouToAddTo[pupilUsername];
                            if(pupilToAddTo){
                                let obj = pupilToAddTo.find( element => element.pupil.username === pupil.username);
                                if(obj){
                                    obj.doublets.push({evaluation1: eva, evaluation2: eva2});
                                }
                            }
                        }
                        else{
                            let newReturnEntry = {};
                            newReturnEntry[ou.label] = {};
                            newReturnEntry[ou.label][pupilUsername] = [];
                            newReturnEntry[ou.label][pupilUsername].push({pupil, doublets: [{evaluation1: eva, evaluation2: eva2}]});
                            returnValues.push(newReturnEntry); 
                        }
                    }
                }
            }
        }

        res.status(200).send(returnValues);
    }catch(err){
        handleError(err, req, res);
    }
});

router.get('/', (req, res) => {
    var ouId, pupilId;
    if (req.query['ou'] && req.query['pupil']) {
        ouId = +req.query['ou'];
        pupilId = +req.query['pupil'];
    }
    Evaluation.findAll({ where: { UserId: req.authUser.id } })
        .then(async allRecords => {
            if (ouId && pupilId) {
                let records = [];

                for await (let record of allRecords) {
                    if (record.OrganizationalUnitId == ouId && record.PupilId == pupilId) {
                        records.push(record);
                    }
                }
                res.status(200).send(outputFormatter(records));
            } else {
                res.status(200).send(outputFormatter(allRecords));
            }
        })
        .catch(err => {
            err.statusCode = 500;
            handleError(err, req, res);
        })
});
router.get('/:id', selectById, (req, res) => {
    res.status(200).send(req.selectedRecord);
})

router.post('/', async (req, res) => {

    delete req.body.id;
    req.body.UserId = req.authUser.id;
    if (req.query['ou'] && req.query['pupil']) {
        try {
            let ouId = +req.query['ou'];
            let pupilId = +req.query['pupil'];

            let constraintsOk = await checkPostConstraints(ouId, pupilId, req.authUser.id);
            if (!constraintsOk) {
                throw new AppError(400, 'Constraints');
            }

            let record = { ...req.body, OrganizationalUnitId: ouId, PupilId: pupilId };
            Evaluation.create(record)
                .then(createdRecord => {
                    res.status(201).send(outputFormatter(createdRecord));
                })
                .catch(err => {
                    err.statusCode = 400;
                    handleError(err, req, res);
                });
        }
        catch (err) {
            err.statusCode = 400;
            handleError(err, req, res);
        }
    } else {
        res.status(400).send();
    }
});


router.put('/:id', selectById, validateCompleteRecord, doUpdate);

router.patch('/:id', selectById, validatePartialRecord, doUpdate);

function validateCompleteRecord(req, res, next) {
    validateUserObjectForUpdate(req, res, next, true);
}
function validatePartialRecord(req, res, next) {
    validateUserObjectForUpdate(req, res, next, false);
}

router.delete('/:id', selectById, (req, res) => {
    req.selectedRecord.destroy()
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

function validateUserObjectForUpdate(req, res, next, fullUpdate) {
    let compareRecord = req.selectedRecord.toJSON();

    delete compareRecord.id;
    delete compareRecord.UserId;
    delete compareRecord.updatedAt;
    delete compareRecord.createdAt;
    delete compareRecord.OrganizationalUnitId;
    delete compareRecord.PupilId;

    if (fullUpdate) {
        if (Object.keys(compareRecord).length != Object.keys(req.body).length) {
            throw new AppError(400, 'number o properties in object not valid');
        }
    }

    if (Object.keys(req.body).some(k => { return compareRecord[k] === undefined; })) {
        throw new AppError(400, 'properties in object not valid');
    }
    next();
}
function doUpdate(req, res) {
    req.selectedRecord.update(req.body)
        .then((record) => {
            res.status(200).json(record);
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
}

async function selectById(req, res, next) {
    let reqId = parseInt(req.params.id);
    if (isNaN(reqId)) {
        throw new AppError(400, 'Given id was not a number.');
    }
    Evaluation.findOne({ where: { id: reqId } })
        .then(async (record) => {
            if (record == null) {
                throw new AppError(404, 'Not found');
            }
            let constraintsOk = await checkRecordConstraints(record, req.authUser.id);
            if (!constraintsOk) {
                throw new AppError(404, 'Not found');
            }
            req.selectedRecord = record;
            next();
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
            return;
        });
}

async function checkPostConstraints(ouId, pupilId, userId) {
    let ouConstraints = false;
    let pupilConstraints = false;

    ouConstraints = (await checkOUConstraints(await OU.findOne({ where: { id: ouId } }), userId));
    let pupil = await Pupil.findOne({ where: { id: pupilId, UserId: userId } });
    let OUs = await pupil.getOrganizationalUnits();
    let ou = OUs.find((ou) => { if (ou.id === ouId) return ou; });
    if (ou) {
        pupilConstraints = true;
        if (ou.A_PupilOU.locked) {
            pupilConstraints = false;
        }
    }
    return pupilConstraints && ouConstraints;
}

async function checkRecordConstraints(record, userId) {
    let userHasPupil = null;
    let userHasOu = null;
    let recordBelongsToThisUser = null;

    recordBelongsToThisUser = userId == record.UserId;
    userHasPupil = (await Pupil.findOne({ where: { id: record.PupilId, UserId: userId } })) != null;
    userHasOu = (checkOUConstraints(await OU.findOne({ where: { id: record.OrganizationalUnitId } }), userId));
    return (userHasPupil && userHasOu && recordBelongsToThisUser);
}

async function checkOUConstraints(ou, userId) {
    let period = null;
    try {
        period = await Period.findOne({ where: { id: ou.PeriodId, UserId: userId } });
        if (!period.active)
            period = null;

        let ouPeriod = ou.PeriodId;
        let idActivePeriod = period.id;
        if (ouPeriod != idActivePeriod)
            period = null;

    } catch (err) {
        err.statusCode = 500;
        handleError(err, req, res);
    }
    return period != null;
}
module.exports = router;