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
});

describe(`Testing Periods API`, function () {
    //TODO: Delete periods created for testcases after they are used
    //#region Get
    it(`GET SUCCESS - All periods`, function (done) {
        request(app)
            .get('/api/periods')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`GET ONE SUCCESS - One period`, function (done) {
        //TODO: CREATE ONE PERIOD FIRST
        createPeriod((err, id) => {
            if (err) {
                return done(err);
            }
            request(app)
                .get(`/api/periods/${id}`)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        })

    });
    it(`GET ONE ERROR - One period; not found`, function (done) {
        //TODO: CREATE ONE PERIOD FIRST
        let id = 404;
        request(app)
            .get(`/api/periods/${id}`)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
    //#region Post
    it(`POST ONE SUCCESS - Create one`, function (done) {
        request(app)
            .post(`/api/periods`)
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`POST ONE ERROR - Already exists`, function (done) {
        let label = 'AlreadyExistsPeriod';
        createPeriod((err, id) => {
            if (err) {
                return done(err);
            }
            request(app)
                .post(`/api/periods`)
                .send({ label: label, from: new Date('2020-27-02'), till: new Date('2022-27-03') })
                .expect(409)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        }, label);
    });
    it(`POST ONE ERROR - Invalid input, object invalid`, function (done) {
        request(app)
            .post(`/api/periods`)
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000) })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
    //#region Put
    //#endregion
    //#region Patch
    //#endregion
    //#region Delete
    it(`DELETE SUCCESS - One Period`, function (done) {
        createPeriod((err, id) => {
            if (err) {
                return done(err);
            }
            request(app)
                .delete(`/api/periods/${id}`)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        })
    });
    it(`DELETE ERROR - Not found`, function (done) {
        let id = -1;
        request(app)
            .delete(`/api/periods/${id}`)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
});

function createPeriod(callback, label) {
    let id;
    if (!label) {
        label = 'TestPeriod' + Math.floor(Math.random() * 1000)
    }
    request(app)
        .post(`/api/periods`)
        .send({
            label: label,
            from: Date.now(),
            till: new Date('2022-27-03')
        })
        .end((err, res) => {
            if (!res.body.id) {
                assert.fail('Period creation failed');
            }
            callback(err, res.body.id);
        });
}