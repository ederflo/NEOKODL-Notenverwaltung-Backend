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
const db = require('../Services/database');
const TimeSlot = db.model('TimeSlot');
const OU = db.model('OrganizationalUnit');
const Period = db.model('Period');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;
const outputFormatter = require('../Services/outPutFormatter');
const dataAccess = require('../services/dataAccess');

router.get('/', async (req, res) => {
    let timeSlots = [];
    let userId = req.authUser.id;
    let ouId = req.query.ouId;
    let ou = undefined;
    try {
        if (ouId) {
            ou = await OU.findOne({ where: { id: ouId }});
            if (!ou) {
                throw new AppError(404, 'OU not found!');
            }
            if (await OUBelongsToUser(ou, userId)) {
                let ts = await getTimeSlotsOfOu(userId, ou)
                timeSlots.push.apply(timeSlots, ts)
            }
        } else {
            timeSlots = await getTimeSlotsOfActivePeriod(req.authUser.id);
        }
        res.status(200).json(timeSlots);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        handleError(err, req, res);
    }
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(req.selectedTimeSlot);
});

router.post('/', async (req, res) => {
    delete req.body.id;
    var timeSlot = req.body;
    await createTimeSlot(req, res, timeSlot);
});

router.post('/:id', async (req, res) => {
    delete req.body.id;
    let ouId = parseInt(req.params.id);
    var timeSlot = req.body;
    timeSlot.OrganizationalUnitId = ouId;
    await createTimeSlot(req, res, timeSlot);
});

router.put('/:id', selectById, validateCompleteTimeSlot, doUpdate);

router.patch('/:id', selectById, validatePartialTimeSlot, doUpdate);

router.delete('/:id', selectById, (req, res) => {
    req.selectedTimeSlot.destroy()
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

async function getTimeSlotsOfActivePeriod(userId) {
    let timeSlots = [];
    let periodId = await getActivePeriodId(userId);
    let ous = await OU.findAll({ where: { PeriodId: periodId }});
    for (let ou of ous) {
        let ts = await getTimeSlotsOfOu(userId, ou);
        timeSlots.push.apply(timeSlots, ts);
    }
    return timeSlots;
}

async function getTimeSlotsOfOu(userId, ou) {
    let result = null;
    try {
        if (await OUBelongsToUser(ou, userId))
        result = await TimeSlot.findAll({ where: { OrganizationalUnitId: ou.id }});
    } catch (err) {
        console.error(err);
    }
    return result;
}

async function selectById(req, res, next) {
    let reqId = parseInt(req.params.id);
    if (isNaN(reqId)) {
        throw new AppError(400, 'Given id was not a number.');
    }
    TimeSlot.findOne({ where: { id: reqId } })
        .then(async timeSlot => {
            if (timeSlot == null)
                throw new AppError(404, 'Not found');
            let belongsToUser = await timeSlotBelongsToUser(timeSlot.OrganizationalUnitId, req.authUser.id);
            if (!belongsToUser)
                throw new AppError(404, 'Not found');
            req.selectedTimeSlot = timeSlot;
            next();
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
            return;
        });
}

async function createTimeSlot(req, res, timeSlot) {
    TimeSlot.create(timeSlot)
        .then((createdTimeSlot) => {
            res.status(201).json(outputFormatter(createdTimeSlot));
        })
        .catch((err) => {
            err.statusCode = 400;
            handleError(err, req, res);
        });
}

function validateCompleteTimeSlot(req, res, next) {
    validateTimeSlotObjectForUpdate(req, res, next, true);
}
function validatePartialTimeSlot(req, res, next) {
    validateTimeSlotObjectForUpdate(req, res, next, false);
}
function validateTimeSlotObjectForUpdate(req, res, next, fullUpdate) {
    let compareTimeSlot = req.selectedTimeSlot.toJSON();

    req.body.OrganizationalUnitId = req.selectedTimeSlot.OrganizationalUnitId;
    delete compareTimeSlot.id;
    delete compareTimeSlot.createdAt;
    delete compareTimeSlot.updatedAt;

    if (fullUpdate) {
        if (Object.keys(compareTimeSlot).length != Object.keys(req.body).length) {
            throw new AppError(400, 'number o properties in object not valid');
        }
    }

    if (Object.keys(req.body).some(k => { return compareTimeSlot[k] == undefined; })) {
        throw new AppError(400, 'properties of object do not match');
    }

    next();
}
function doUpdate(req, res) {
    req.selectedTimeSlot.update(req.body)
        .then((ou) => {
            res.status(200).json(outputFormatter(ou));
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
}

async function getActivePeriodId(userId) {
    let period = await Period.findOne({ where: { UserId: userId, active: true } });
    if (period == null)
        return;
    return period.id;
}

async function OUBelongsToUser(ou, userId) {
    return (await Period.findOne({ where: { id: ou.PeriodId, UserId: userId } })) != null;
}


async function timeSlotBelongsToUser(ouId, userId) {
    let ou = await OU.findOne({ where: { id: ouId }});
    return (await Period.findOne({ where: { id: ou.PeriodId, UserId: userId } })) != null;
}

module.exports = router;