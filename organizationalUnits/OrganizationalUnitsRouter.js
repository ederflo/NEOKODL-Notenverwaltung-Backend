/*

HTTP Endpoints for the ou - REST API

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
const db = require('../services/database');
const OU = db.model('OrganizationalUnit');
const Period = db.model('Period');
const AppError = require('../services/error-management').AppError;
const handleError = require('../services/error-management').handleError;
const outputFormatter = require('../services/outPutFormatter');
const timeSlotRouter = require('../timeSlots/TimeSlotRouter');

router.get('/', async (req, res) => {
    let periodId = req.query.periodId;
    if (!periodId) {
        let activePeriodId;
        try {
            activePeriodId = await getActivePeriodId(req.authUser.id)
            if (!activePeriodId)
                throw new AppError(404, 'No active period');
        } catch (err) {
            handleError(err, req, res);
            return;
        }
        periodId = activePeriodId;
    }
    try {
        if (!await periodBelongsToUser(periodId, req.authUser.id))
            res.status(404).send('Given period not found!');
    } catch (err) {
        handleError(err, req, res);
        return;
    }
    
    OU.findAll({ where: { PeriodId: periodId } })
        .then((ous) => {
            res.status(200).json(outputFormatter(ous));
        })
        .catch((err) => {
            handleError(err, req, res);
        });
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(outputFormatter(req.selectedOrganizationalUnit));
});

router.post('/', async (req, res) => {
    delete req.body.id;
    var organizationalUnit = req.body;
    let activePeriodId;
    try {
        activePeriodId = await getActivePeriodId(req.authUser.id)
        if (!activePeriodId)
            throw new AppError(404, 'No active period');
    } catch (err) {
        handleError(err, req, res);
        return;
    }
    organizationalUnit.PeriodId = activePeriodId;
    OU.create(organizationalUnit)
        .then((createdOU) => {
            res.status(201).json(outputFormatter(createdOU));
        })
        .catch((err) => {
            err.statusCode = 400;
            handleError(err, req, res);
        });
});

router.put('/:id', selectById, validateCompleteOU, doUpdate);

router.patch('/:id', selectById, validatePartialOU, doUpdate);

router.delete('/:id', selectById, (req, res) => {
    req.selectedOrganizationalUnit.destroy()
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            err.statusCode = 404;
            handleError(err, req, res);
        });
});

async function selectById(req, res, next) {
    let reqId = parseInt(req.params.id);
    if (isNaN(reqId)) {
        throw new AppError(400, 'Given id was not a number.');
    }
    OU.findOne({ where: { id: reqId } })
        .then(async (ou) => {
            if (ou == null) 
                throw new AppError(404, 'Not found');
            let belongsToUser = await OUBelongsToUser(ou, req.authUser.id);
            if (!belongsToUser)
                throw new AppError(404, 'Not found');

            req.selectedOrganizationalUnit = ou;
            next();
        })
        .catch(err => {
            handleError(err, req, res);
            return;
        });
}

function validateCompleteOU(req, res, next) {
    validateOUObjectForUpdate(req, res, next, true);
}
function validatePartialOU(req, res, next) {
    validateOUObjectForUpdate(req, res, next, false);
}
function validateOUObjectForUpdate(req, res, next, fullUpdate) {
    let compareOU = req.selectedOrganizationalUnit.toJSON();

    req.body.PeriodId = req.selectedOrganizationalUnit.PeriodId;
    delete compareOU.id;
    delete compareOU.createdAt;
    delete compareOU.updatedAt;

    if (fullUpdate) {
        if (Object.keys(compareOU).length != Object.keys(req.body).length) {
            throw new AppError(400, 'number o properties in object not valid');
        }
    }

    if (Object.keys(req.body).some(k => { return compareOU[k] == undefined; })) {
        throw new AppError(400, 'properties of object do not match');
    }
    next();
}
function doUpdate(req, res) {
    req.selectedOrganizationalUnit.update(req.body)
        .then((ou) => {
            res.status(200).json(outputFormatter(ou));
        })
        .catch((err) => {
            handleError(err, req, res);
        });
}

async function getActivePeriodId(userId) {
    let period = null;
    try {
        period = await Period.findOne({ where: { UserId: userId, active: true } });
    } catch(err) {
        handleError(err, req, res);
        return;
    }
    return period.id;
}

async function OUBelongsToUser(ou, userId) {
    let period = null;
    try {
        period = await Period.findOne({ where: { id: ou.PeriodId, UserId: userId } });
    } catch (err) {
        handleError(err, req, res);
        return;
    }
    return period != null;
}

async function periodBelongsToUser(periodId, userId) {
    let period;
    try {
        period = await Period.findOne({ where: { id: periodId, UserId: userId } });
    } catch(err) {
        handleError(err, req, res);
        return;
    }
    return period != null;
}

router.getOUsByPeriodId = async (periodId, userId) => {
    return await Period.findOne({ where: { id: periodId, UserId: userId } });
}

router.getCurrentOU = async (userId) => {
    let timeSlot = await timeSlotRouter.getCurrentTimeSlot(userId);
}

module.exports = router;