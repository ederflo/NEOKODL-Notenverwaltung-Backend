'use strict'

const express = require('express');
const db = require('../Services/database');
const jwt = require('jsonwebtoken');
const User = db.model('User');
//const { handleError, ErrorHandler } = require('./../helpers/error')
const controller = {}

const Bcrypt = require('bcrypt');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const secret = 'Bearer';

controller.login = async function (req, res) {
    let credentials = req.body;
    let token = '';

    //Payload Check
    if (!checkValidLoginPayload(credentials)) {
        res.status(401).send('Authentication failed!');
        return;
    }

    let userFromDb = null;
    try {
        userFromDb = await User.findOne({ where: { username: credentials.username } });
        if (userFromDb == null) {
            res.status(401).send('Authentication failed!');
            console.log('Access denied! User does not exist');
            return;
        }
        if (!await Bcrypt.compare(credentials.password, userFromDb.password)) {
            res.status(401).send('Authentication failed!');
            return;
        }
        token = generateUserToken(userFromDb);
        userFromDb.status = 'online';
        await userFromDb.save();
        res.status(200).send({ 'token': token });
    } catch (err) {

    }
};

controller.verifyToken = async function (req, res, next) {
    let bearerHeader = req.headers['authorization'];
    let decryptedToken = undefined;
    if (!bearerHeader || typeof (bearerHeader) != 'string' || bearerHeader.length <= 0) {
        res.status(403).send('Forbidden!');
        return;
    }

    let tokenParts = bearerHeader.split(' ');
    if (tokenParts.length != 2 || tokenParts[0] != secret) {
        res.status(403).send('Forbidden!');
        return;
    }
    try {
        decryptedToken = jwt.verify(tokenParts[1], 'neokodl');
    } catch (err) {
        res.status(403).send('Forbidden!');
        return;
    }
    if (!decryptedToken.id || !decryptedToken.username) {
        res.status(403).send('Forbidden!');
        return;
    }

    let user = {
        'id': decryptedToken.id,
        'username': decryptedToken.username,
    }
    req.authUser = user;
    next();
}

function checkValidLoginPayload(payload) {
    let isValid = false;
    if (Object.keys(payload).length == 2) {
        if (payload['username'] != undefined && payload['password'] != undefined) {
            isValid = true;
        }
    }
    return isValid;
}

function generateUserToken(userFromDb) {
    return jwt.sign({ id: userFromDb.id, username: userFromDb.username }, 'neokodl', { expiresIn: '3h' });
}

module.exports = controller;