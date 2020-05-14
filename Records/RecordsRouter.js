const express = require('express');
const router = express.Router();
const db = require('../Services/database');
const Record = db.model('Record');
const Pupil = db.model('Pupil');
const OU = db.model('OrganizationalUnit');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;

router.get('/', (req, res) => {
    Record.findAll() //{where: { UserId: req.authUser.id} }
    .then(allRecords => {
        res.status(200).send(allRecords);
    })
    .catch(err => {
        err.statusCode = 500;
        handleError(err, req, res);
    })
});
router.get('/:id', selectById, (req, res) => {
    res.status(200).send(req.selectedRecord);
})

router.post('/', (req, res) => {
    //check if ou is in period
    //check if pupil belongs to ou
    if(req.query['ou'] && req.query['pupil']){
        try{
            let ouId = +req.query['ou'];
            let pupilId = +req.query['pupil'];
            
            let record = { ... req.body, OrganizationalUnitId: ouId, PupilId: pupilId};
            Record.create(record)
            .then(createdRecord => {
                res.status(201).send(createdRecord);
            })
            .catch(err => {
                err.statusCode = 400;
                handleError(err, req, res);
            });
        }
        catch(err){
            err.statusCode = 400;
            handleError(err, req, res);
        }
    } else {
        res.send(400).send();
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

    if (fullUpdate) {
        if (Object.keys(compareRecord).length != Object.keys(req.body).length) {
            throw new AppError(400, 'number o properties in object not valid');
        }
    }

    if (Object.keys(req.body).some(k => { return compareRecord[k] === undefined; })) {
        throw new AppError(400, 'number o properties in object not valid');
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
    Record.findOne({ where: { id: reqId} })
        .then(async (record) => {
            if (record == null) {
                throw new AppError(404, 'Not found');
            }
            let belongsToUser = await recordBelongsToUser(record, req.authUser.id);
            if(!belongsToUser){
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

//check if OU belongs to user
//check if OU is in period
//check if user can access pupil
async function recordBelongsToUser(record, userId){
    let userHasPupil = null;
    let userHasOu = null;

    userHasPupil = (await Pupil.findOne({where: {id : record.PupilId, UserId: userId}})) != null;
    userHasOu = (await OU.findOne({where: {id: record.OrganizationalUnitId}})) != null; 
    return (userHasPupil && userHasOu);
}
module.exports = router;