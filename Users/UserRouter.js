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

router.get('/', (req, res) => {
    User.findAll()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Something went wrong');
    });
});

router.get('/:id', selectById, (req, res) => {
    res.status(200).json(req.selectedUser);
});

router.post('/', (req, res) => {
    User.create(req.body)
        .then((user) => {
            res.status(201).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Could not create user');
    });
});

router.put('/:id', selectById, validateCompleteUser, doUpdate);

router.patch('/:id', selectById, validatePartialUser, doUpdate);

router.delete('/:id', selectById, (req, res) => {
    req.selectedUser.destroy()
        .then(() => {
            res.status(200).send('User deleted');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Something went wrong');
    });
});

function selectById(req, res, next) {
    User.findOne({ where: { id: req.params.id } })
        .then(user => {
            if (user == null) {
                res.status(404).send('Not found');
                return;
            }
            req.selectedUser = user;
            next();
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Something went wrong');
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

    delete compareUser.createdAt;
    delete compareUser.updatedAt;

    if (fullUpdate) {
        if (Object.keys(compareUser).length != Object.keys(req.body).length) {
            res.status(400).send('number o properties in object not valid');
            return;
        }
    }

    if (Object.keys(req.body).some(k => { return compareUser[k] == undefined; })) {
        res.status(400).send('properties of object do not match');
        return;
    }

    next();
}
function doUpdate(req, res) {
    req.selectedUser.update(req.body)
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Something went wrong');
    });
}
module.exports = router;