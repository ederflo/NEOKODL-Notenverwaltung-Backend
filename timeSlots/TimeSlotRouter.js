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

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(outputFormatter(req.selectedTimeSlot));
});

router.post('/', async (req, res) => {
    delete req.body.id;
    var timeSlot = req.body;
    OU.create(timeSlot)
        .then((createdTimeSlot) => {
            res.status(201).json(outputFormatter(createdTimeSlot));
        })
        .catch((err) => {
            err.statusCode = 400;
            handleError(err, req, res);
        });
});

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

async function timeSlotBelongsToUser(ouId, userId) {
    let ou = await OU.findOne({ where: { id: ouId }});
    return (await Period.findOne({ where: { id: ou.PeriodId, UserId: userId } })) != null;
}

module.exports = router;