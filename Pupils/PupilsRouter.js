/*

HTTP Endpoints for the period - REST API

Method  |   url

GET     |   /
GET     |   ?ou={id}
GET     |   /:id
POST    |   /
POST    |   ?ou={id}
PUT     |   /:id
PATCH   |   /lock?ou={ouId}&pupil={pupilId}
PATCH   |   /AddToOU?ou={ouId}&pupil={pupilId}
PATCH   |   /RemoveFromOU?ou={ouId}&pupil={pupilId}
PATCH   |   /:id
DELETE  |   /:id

*/

const express = require('express');
const router = express.Router();
const db = require('../Services/database');
const Pupil = db.model('Pupil');
const OU = db.model('OrganizationalUnit');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;
const outPutFormatter = require('../Services/outPutFormatter');

//get period based

router.get('/', (req, res) => {
    var ouId;
    if (req.query['ou']) {
        ouId = +req.query['ou'];
    }
    Pupil.findAll({ where: { UserId: req.authUser.id } })
        .then(async (pupils) => {
            if (ouId) {
                let pups = [];
                for await (let pupil of pupils) {

                    let inOu = await pupil.hasOrganizationalUnits(ouId);
                    if (inOu) {
                        let relevantOUs = await pupil.getOrganizationalUnits();
                        let relevantOU = relevantOUs.find(ou => ou.id === ouId);
                        let locked = relevantOU.A_PupilOU.locked;
                        pups.push({ ...pupil.dataValues, locked: locked });
                    }
                }
                //outputformatter erweitern
                res.status(200).json(pups);
            } else {
                res.status(200).json(outPutFormatter(pupils));
            }
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(outPutFormatter(req.selectedPupil));
});

router.post('/', (req, res) => {
    delete req.body.id;
    req.body.UserId = req.authUser.id;
    var ouId;
    if (req.query['ou']) {
        ouId = req.query['ou'];
    }
    Pupil.create(req.body)
        .then(async (pupil) => {
            if (ouId) {
                let isOk = await checkOUConstraints(ouId, req);
                if (isOk) {
                    await pupil.addOrganizationalUnit(ouId, { through: { locked: false } });
                    res.status(201).json(outPutFormatter(pupil));
                } else {
                    pupil.destroy();
                    //toDo: specify error message
                    //throw new AppError(400, 'OU constraints', '');
                    res.status(400).send('OU constraints');
                }
            }
            else {
                res.status(201).json(outPutFormatter(pupil));
            }
        })
        .catch((err) => {
            err.statusCode = 400;
            handleError(err, req, res);
        });
});

router.put('/:id', selectById, validateCompletePupil, doUpdate);

router.patch('/lock', (req, res) => {
    //toDo: check if OU is in Period and if OU belongs to User
    if (!req.query['ou'] || !req.query['pupil']) {
        throw new AppError(400, 'Bad query params', '', '');
    }
    let ouId = +req.query['ou'];
    let pupilid = +req.query['pupil'];

    Pupil.findOne({ where: { id: pupilid, UserId: req.authUser.id } })
        .then(async pupil => {
            let isPupilInOU = await pupil.hasOrganizationalUnits(ouId);
            if (!isPupilInOU) {
                res.status(400).send('Pupil is not in this OrganizationalUnit');
                return;
            }
            let relevantOUs = await pupil.getOrganizationalUnits();
            let relevantOU = relevantOUs.find(ou => ou.id === ouId);
            if (!relevantOU) {
                res.status(404).send('Not found');
                return;
            }
            let locked = relevantOU.A_PupilOU.locked;
            await pupil.setOrganizationalUnits(relevantOU, { through: { locked: !locked } });

            res.status(204).send();
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
        })
});

router.patch('/AddToOU', (req, res) => {
    //toDo: check if OU is in Period and if OU belongs to User
    if (!req.query['ou'] || !req.query['pupil']) {
        throw new AppError(400, 'Bad query params', '', '');
    }
    let ouId = +req.query['ou'];
    let pupilid = +req.query['pupil'];

    Pupil.findOne({ where: { id: pupilid, UserId: req.authUser.id } })
        .then(async pupil => {
            try {
                let isPupilInOU = await pupil.hasOrganizationalUnits(ouId);
                if (isPupilInOU) {
                    res.status(400).send('Pupil is already in this OrganizationalUnit.');
                    return;
                }
                await pupil.addOrganizationalUnit(ouId, { through: { locked: false } });
                res.status(204).send('Added Pupil to OU.');
            } catch (err) {
                console.log(err);
            }
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
        });
});

router.patch('/RemoveFromOU', (req, res) => {
    //toDo: check if OU is in Period and if OU belongs to User
    if (!req.query['ou'] || !req.query['pupil']) {
        throw new AppError(400, 'Bad query params', '', '');
    }
    let ouId = +req.query['ou'];
    let pupilid = +req.query['pupil'];

    Pupil.findOne({ where: { id: pupilid, UserId: req.authUser.id } })
        .then(async pupil => {
            let isPupilInOU = await pupil.hasOrganizationalUnits(ouId);
            if (!isPupilInOU) {
                res.status(400).send('Pupil is not in this OrganizationalUnit.');
                return;
            }
            await pupil.removeOrganizationalUnit(ouId, { through: { locked: false } });
            res.status(204).send('Removed Pupil from OU.');
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
        });
});
router.patch('/:id', selectById, validatePartialPupil, doUpdate);

router.delete('/:id', selectById, async (req, res) => {
    let nrOfOus = await req.selectedPupil.countOrganizationalUnits();
    if (nrOfOus != 0) {
        res.status(400).send('Pupil is still associated with OUs.');
        return;
    }
    req.selectedPupil.destroy()
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

function validateCompletePupil(req, res, next) {
    validateUserObjectForUpdate(req, res, next, true);
}
function validatePartialPupil(req, res, next) {
    validateUserObjectForUpdate(req, res, next, false);
}
function validateUserObjectForUpdate(req, res, next, fullUpdate) {
    let comparePupil = req.selectedPupil.toJSON();

    delete comparePupil.id;
    delete comparePupil.createdAt;
    delete comparePupil.updatedAt;
    delete comparePupil.UserId;

    if (fullUpdate) {
        if (Object.keys(comparePupil).length != Object.keys(req.body).length) {
            throw new AppError(400, 'number o properties in object not valid');
        }
    }

    if (Object.keys(req.body).some(k => { return comparePupil[k] == undefined; })) {
        throw new AppError(400, 'number o properties in object not valid');
    }
    next();
}
function doUpdate(req, res) {
    req.selectedPupil.update(req.body)
        .then((pupil) => {
            res.status(200).json(outPutFormatter(pupil));
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
}
function selectById(req, res, next) {
    let reqId = parseInt(req.params.id);
    if (isNaN(reqId)) {
        throw new AppError(400, 'Given id was not a number.');
    }
    Pupil.findOne({ where: { id: reqId, UserId: req.authUser.id } })
        .then(pupil => {
            if (pupil == null) {
                throw new AppError(404, 'Not found');
            }
            req.selectedPupil = pupil;
            next();
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
            return;
        });
}
async function checkOUConstraints(ouId, req) {
    //toDo: check if OU is in Period and if OU belongs to User
    let seqObject = await OU.findAndCountAll({ where: { id: ouId } });
    if (seqObject.count !== 1) {
        return false;
    }
    return true;
}
module.exports = router;