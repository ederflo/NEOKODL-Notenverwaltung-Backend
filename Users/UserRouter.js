/*

HTTP Endpoints for the user - REST API

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
const User = db.model('User');
const authController = require('../Authentication/AuthenticationController');
const AppError = require('../Services/error-management').AppError;
const handleError = require('../Services/error-management').handleError;
const outputFormatter = require('../Services/outPutFormatter');

router.get('/', authController.verifyToken, (req, res) => {
    User.findAll()
        .then((users) => {
            res.status(200).json(outputFormatter(users));
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

router.get('/:id', authController.verifyToken, selectById, (req, res) => {
    res.status(200).json(outputFormatter(req.selectedUser));
});

router.post('/', (req, res) => {
    delete req.body.id;
    User.create(req.body)
        .then((user) => {
            res.status(201).json(outputFormatter(user));
        })
        .catch((err) => {
            err.statusCode = 400;
            handleError(err, req, res);
        });
});

router.put('/:id', authController.verifyToken, selectById, validateCompleteUser, doUpdate);

router.patch('/:id', authController.verifyToken, selectById, validatePartialUser, doUpdate);

router.delete('/:id', authController.verifyToken, selectById, (req, res) => {
    req.selectedUser.destroy()
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
});

function selectById(req, res, next) {
    let reqId = parseInt(req.params.id);
    if (isNaN(reqId)) {
        throw new AppError(400, 'Given id was not a number.');
    }
    User.findOne({ where: { id: reqId } })
        .then(user => {
            if (user == null) {
                throw new AppError(404, 'Not found');
            }
            req.selectedUser = user;
            next();
        })
        .catch(err => {
            err.statusCode = 404;
            handleError(err, req, res);
            return;
        });
}
function validateCompleteUser(req, res, next) {
    validateUserObjectForUpdate(req, res, next, true);
}
function validatePartialUser(req, res, next) {
    validateUserObjectForUpdate(req, res, next, false);
}
function validateUserObjectForUpdate(req, res, next, fullUpdate) {
    let compareUser = req.selectedUser.toJSON();

    delete compareUser.id;
    delete compareUser.createdAt;
    delete compareUser.updatedAt;
    delete req.body.user;

    if (fullUpdate) {
        if (Object.keys(compareUser).length != Object.keys(req.body).length) {
            throw new AppError(400, 'number o properties in object not valid');
        }
    }

    if (Object.keys(req.body).some(k => { return compareUser[k] == undefined; })) {
        throw new AppError(400, 'number o properties in object not valid');
    }
    next();
}
function doUpdate(req, res) {
    req.selectedUser.update(req.body)
        .then((user) => {
            res.status(200).json(outputFormatter(user));
        })
        .catch((err) => {
            err.statusCode = 500;
            handleError(err, req, res);
        });
}
module.exports = router;