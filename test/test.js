/**
 * Http tests for http testing
 */

const assert = require('assert');
const http = require('http');
const app = require('../server');
const request = require('supertest');

const conn = "http://localhost:5000"

describe('Testing Server connection', function () {
    it('Should return 200', function (done) {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it('Should say "jo"', function (done) {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});

describe(`Testing Users API`, function() {
    it(`Should return 501 - GET users`, function(done) {
        request(app)
            .get('/api/users/id')
            .expect(501)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`Should return 501 - GET user by id`, function(done) {
        request(app)
            .get('/api/users/id')
            .expect(501)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`Should return 501 - POST user`, function(done) {
        request(app)
            .post('/api/users/')
            .expect(501)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`Should return 501 - PUT User by id`, function(done) {
        request(app)
            .put('/api/users/id')
            .expect(501)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`Should return 501 - PATCH by id`, function(done) {
        request(app)
            .patch('/api/users/id')
            .expect(501)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`Should return 501 - DELETE by id`, function(done) {
        request(app)
            .delete('/api/users/id')
            .expect(501)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});