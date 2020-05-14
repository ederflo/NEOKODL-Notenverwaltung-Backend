const express = require('express');
const router = express.Router();
const db = require('../Services/database');
const Pupil = db.model('Pupil');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;
const outPutFormatter = require('../Services/outPutFormatter');

router.get('/', (req, res) => {
    Pupil.findAll({ where: { UserId: req.authUser.id } })
        .then((pupils) => {
            res.status(200).json(outPutFormatter(pupils));
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

    //params abfragen

    Pupil.create(req.body)
        .then((pupil) => {
            res.status(201).json(outPutFormatter(pupil));
        })
        .catch((err) => {
            err.statusCode = 400;
            handleError(err, req, res);
        });
});

router.put('/:id', selectById, validateCompletePupil, doUpdate);

router.patch('/:id', selectById, validatePartialPupil, doUpdate);

router.delete('/:id', selectById, (req, res) => {
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

module.exports = router;