/**
 * Http tests for http testing
 * USR - User api/v1
 * PRD - Period api/v1
 */

const assert = require('assert');
const http = require('http');
const app = require('../server');
const request = require('supertest');

const successUser = { username: 'CoolGuy', password: '12345', active: true };

const authUser1 = { username: 'authUser1', password: 'auth1', active: true };
const authUser2 = { username: 'authUser2', password: 'auth2', active: true };

var authUserToken1 = 'Bearer ';
var authUserToken2 = 'Bearer ';
var token = 'Bearer ';

var periodIdForOUs;


before(done => {
    app.on('app_started', function () {
        done();
    })
})

describe('Testing Server connection', function () {
    it('Server - Should return 200', function (done) {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});

describe(`Testing Authorization api/v1`, function () {
    //TODO: Delete periods created for testcases after they are used
    it(`AUTH-CREATE AuthUser1`, function (done) {
        request(app)
            .post('/api/v1/users/')
            .send(authUser1)
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('AUTH-LOGIN SUCCESS', function (done) {
        request(app)
            .post('/api/v1/auth/login')
            .send({ username: authUser1.username, password: authUser1.password })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                authUserToken1 += res.body.token;
                done();
            });
    });
    it('AUTH-LOGIN ERROR - Invalid property names', function (done) {
        request(app)
            .post('/api/v1/auth/login')
            .send({ userName: authUser1.username, passwort: authUser1.password })
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('AUTH-LOGIN ERROR - Too less properties', function (done) {
        request(app)
            .post('/api/v1/auth/login')
            .send({ userName: authUser1.username })
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('AUTH-LOGIN ERROR - Too many properties', function (done) {
        request(app)
            .post('/api/v1/auth/login')
            .send({ userName: authUser1.username, passwort: authUser1.password, email: "test@gmx.at" })
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('AUTH-AUTHORIZATION SUCCESS - User accesses secret page', function (done) {
        request(app)
            .get('/secret')
            .set({ Authorization: authUserToken1 })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('AUTH-AUTHORIZATION ERROR - Wrong token', function (done) {
        request(app)
            .get('/secret')
            .set({ Authorization: '123456789abcdefghijklmnopqrstuvwxyz' })
            .expect(403)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('AUTH-AUTHORIZATION ERROR - No token', function (done) {
        request(app)
            .get('/secret')
            .expect(403)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});

// TODO: Too less properties test
describe(`Testing Users api/v1`, function () {

    it(`USR-POST SUCCESS`, function (done) {
        request(app)
            .post('/api/v1/users/')
            .send(successUser)
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it('USR-LOGIN', function (done) {
        request(app)
            .post('/api/v1/auth/login')
            .send({ username: successUser.username, password: successUser.password })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                token = token + res.body.token;
                done();
            });
    });
    /**
     * GET
     */
    it(`USR-GET SUCCESS - All users`, function (done) {
        request(app)
            .get('/api/v1/users')
            .set({ Authorization: token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`USR-GET SUCCESS - One user`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .get(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .expect(200)
                .end((err, res) => {
                    deleteUser(id);
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    it(`USR-GET ERROR - Invalid id format`, function (done) {
        request(app)
            .get('/api/v1/users/d290f1ee-6c54-4b01-90e6-d701748fffff')
            .set({ Authorization: token })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`USR-GET ERROR - Invalid id`, function (done) {
        request(app)
            .get('/api/v1/users/999')
            .set({ Authorization: token })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    /**
     * POST
     */
    it(`USR-POST ERROR - Already exists`, function (done) {
        request(app)
            .post('/api/v1/users/')
            .send({ username: 'CoolGuy', password: '12345', active: false })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`USR-POST ERROR - Wrong property`, function (done) {
        request(app)
            .post('/api/v1/users/')
            .send({ username: 'CoolGuy', password: '12345', email: 'mail@mail.com' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`USR-POST ERROR - Too many properties`, function (done) {
        request(app)
            .post('/api/v1/users/')
            .send({ username: 'CoolGuy', password: '12345', active: false, age: 17 })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    /**
     * PUT
     */
    it(`USR-PUT SUCCESS`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .send({ username: 'OverWrite', password: '12345', active: false })
                .expect(200)
                .end((err, res) => {
                    deleteUser(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`USR-PUT ERROR - Invalid id`, function (done) {
        request(app)
            .put(`/api/v1/users/d290f1ee-6c54-4b01-90e6-d701748fffff`)
            .set({ Authorization: token })
            .send({ username: 'ErrorWriteId', password: 'error', active: false })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`USR-PUT ERROR - Invalid property`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .send({ name: 'ErrorWriteProp', password: 'error', active: false })
                .expect(400)
                .end((err, res) => {
                    deleteUser(id);
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    it(`USR-PUT ERROR - Too many arguments`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .send({ username: 'ErrorWriteArgs', password: 'error', active: false, age: 17 })
                .expect(400)
                .end((err, res) => {
                    deleteUser(id);
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    /**
     * PATCH
     */
    it(`USR-PATCH SUCCESS - One value`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .send({ username: 'OverPatchName' })
                .expect(200)
                .end((err, res) => {
                    deleteUser(id);
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    it(`USR-PATCH SUCCESS - All values`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .send({ username: 'OverPatchAll', password: '1234', active: false })
                .expect(200)
                .end((err, res) => {
                    deleteUser(id);
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    it(`USR-PATCH ERROR - Invalid id`, function (done) {
        request(app)
            .patch(`/api/v1/users/d290f1ee-6c54-4b01-90e6-d701748fffff`)
            .set({ Authorization: token })
            .send({ username: 'PatchWritePatch', password: 'error', active: false })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`USR-PATCH ERROR - Invalid property`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .send({ name: 'PatchWriteProp', password: 'error', active: false })
                .expect(400)
                .end((err, res) => {
                    deleteUser(id);
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    it(`USR-PATCH ERROR - Too many arguments`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .send({ username: 'PatchWriteArgs', password: 'error', active: false, age: 17 })
                .expect(400)
                .end((err, res) => {
                    deleteUser(id);
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    /**
     * Delete
     */
    it(`USR-DELETE SUCCESS`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .delete(`/api/v1/users/${id}`)
                .set({ Authorization: token })
                .expect(204)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    done();
                });
        });
    });
    it(`USR-DELETE ERROR - Invalid id`, function (done) {
        request(app)
            .delete(`/api/v1/users/d290f1ee-6c54-4b01-90e6-d701748fffff`)
            .set({ Authorization: token })
            .send({ username: 'PatchWritePatch', password: 'error', active: false })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});

describe(`Testing Periods api/v1`, function () {
    //TODO: Delete periods created for testcases after they are used
    //#region Get
    it(`PRD-GET SUCCESS - All periods`, function (done) {
        request(app)
            .get('/api/v1/periods')
            .set({ Authorization: token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PRD-GET ONE SUCCESS - One period`, function (done) {
        //TODO: CREATE ONE PERIOD FIRST
        createPeriod((err, id) => {
            if (err) {
                return done(err);
            }
            request(app)
                .get(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .expect(200)
                .end((err, res) => {
                    deletePeriod(id)
                    if (err) return done(err);
                    done();
                });
        })

    });
    it(`PRD-GET ONE ERROR - One period; not found`, function (done) {
        //TODO: CREATE ONE PERIOD FIRST
        let id = -1;
        request(app)
            .get(`/api/v1/periods/${id}`)
            .set({ Authorization: token })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
    //#region Post
    it(`PRD-POST ONE SUCCESS - Create one`, function (done) {
        request(app)
            .post(`/api/v1/periods`)
            .set({ Authorization: token })
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: '2020-02-27', till: '2022-03-02', active: false, archived: false })
            .expect(201)
            .end((err, res) => {
                deletePeriod(res.body.id);
                if (err) return done(err);
                done();
            });
    });
    it(`PRD-POST ONE ERROR - Wrong amount of arguments`, function (done) {
        request(app)
            .post(`/api/v1/periods`)
            .set({ Authorization: token })
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000) })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PRD-POST ON ERROR - TILL BEFORE FROM`, function (done) {
        request(app)
            .post(`/api/v1/periods`)
            .set({ Authorization: token })
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: '2022-03-02', till: '2020-02-27', active: false, archived: false })
            .expect(400)
            .end((err, res) => {
                deletePeriod(res.body.id);
                if (err) return done(err);
                done();
            });
    });
    it(`PRD-POST ONE ERROR - Wrong agruments`, function (done) {
        request(app)
            .post(`/api/v1/periods`)
            .set({ Authorization: token })
            .send({ name: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
    //#region Put
    it(`PRD-PUT SUCCESS`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: '2020-02-27', till: '2022-03-02', active: false, archived: false })
                .expect(200)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PRD-PUT ERROR - Not found`, function (done) {
        let id = -1;
        request(app)
            .put(`/api/v1/periods/${id}`)
            .set({ Authorization: token })
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: '2020-02-27', till: '2022-03-02', active: false, archived: false })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PRD-PUT ERROR - Invalid property`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .send({ name: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
                .expect(400)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PRD-PUT ERROR - Too many arguments`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03'), duration: '2 years 1 month' })
                .expect(400)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    //#endregion
    //#region Patch
    it(`PRD-PATCH SUCCESS - One value`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .send({ label: 'NewTestPeriod' + Math.floor(Math.random() * 1000) })
                .expect(200)
                .end((err, res) => {
                    deletePeriod(id)
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PRD-PATCH SUCCESS - All values`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .send({ label: 'NewTestPeriod' + Math.floor(Math.random() * 1000), from: '2020-02-27', till: '2022-03-02', active: false, archived: false })
                .expect(200)
                .end((err, res) => {
                    deletePeriod(id)
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PRD-PATCH ERROR - Invalid id`, function (done) {
        let id = -1;
        request(app)
            .patch(`/api/v1/periods/${id}`)
            .set({ Authorization: token })
            .send({ label: 'NewTestPeriod' + Math.floor(Math.random() * 1000), from: '2020-02-27', till: '2022-03-02' })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PRD-PATCH ERROR - Invalid property`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .send({ name: 'shouldNotWork' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
                .expect(400)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PRD-PATCH ERROR - Too many arguments`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03'), duration: '2 years 1 month' })
                .expect(400)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    //#endregion
    //#region Delete
    it(`PRD-DELETE SUCCESS - One Period`, function (done) {
        createPeriod((err, id) => {
            if (err) {
                return done(err);
            }
            request(app)
                .delete(`/api/v1/periods/${id}`)
                .set({ Authorization: token })
                .expect(204)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PRD-DELETE ERROR - Not found`, function (done) {
        let id = -1;
        request(app)
            .delete(`/api/v1/periods/${id}`)
            .set({ Authorization: token })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
});


describe(`Testing OrganizationalUnits api/v1`, function () {
    
    it(`OU-Create Period for OUs`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            periodIdForOUs = id;
            done();
        })
    });

    //#region Get
    it(`OU-GET SUCCESS - All OrganizationalUnits`, function (done) {
        request(app)
            .get('/api/v1/ou')
            .set({ Authorization: token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`OU-GET SUCCESS - One OrganizationalUnit`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
        request(app)
            .get(`/api/v1/ou/${id}`)
            .set({ Authorization: token })
            .expect(200)
            .end((err, res) => {
                deleteOU(id);
                if (err || res.body.id != id) return done(err);
                done();
            });
        });
    });
    it(`OU-GET ONE ERROR - One OrganizationalUnit; not found`, function (done) {
        let id = -1;
        request(app)
            .get(`/api/v1/ou/${id}`)
            .set({ Authorization: token })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
    //#region Post
    it(`OU-POST ONE SUCCESS - Create one`, function (done) {
        request(app)
            .post(`/api/v1/ou`)
            .set({ Authorization: token })
            .send({ label: 'TestOU' + Math.floor(Math.random() * 1000), description: 'This is my test OU!' })
            .expect(201)
            .end((err, res) => {
                deleteOU(res.body.id);
                if (err) return done(err);
                done();
            });
    });
    it(`OU-POST ONE ERROR - Check label not null`, function (done) {
        request(app)
            .post(`/api/v1/ou`)
            .set({ Authorization: token })
            .send({ description: 'TestDesc' + Math.floor(Math.random() * 1000) })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`OU-POST ONE ERROR - Wrong agruments`, function (done) {
        request(app)
            .post(`/api/v1/ou`)
            .set({ Authorization: token })
            .send({ lael: 'TestOU' + Math.floor(Math.random() * 1000), notes: 'This is my test OU!' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
    //#region Put
    it(`OU-PUT SUCCESS`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .send({ label: 'TestOU' + Math.floor(Math.random() * 1000), description: 'This is my test OU!' })
                .expect(200)
                .end((err, res) => {
                    deleteOU(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`OU-PUT ERROR - Not found`, function (done) {
        let id = -1;
        request(app)
            .put(`/api/v1/ou/${id}`)
            .set({ Authorization: token })
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: '2020-02-27', till: '2022-03-02', active: false, archived: false })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`OU-PUT ERROR - Invalid property`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .send({ name: 'TestOU' + Math.floor(Math.random() * 1000), description: 'Gruppe 3' })
                .expect(400)
                .end((err, res) => {
                    deleteOU(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`OU-PUT ERROR - Too many arguments`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .send({ label: 'TestOU' + Math.floor(Math.random() * 1000), description: 'Gruppe 1', numOfPupils: '19' })
                .expect(400)
                .end((err, res) => {
                    deleteOU(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    //#endregion
    //#region Patch
    it(`OU-Patch SUCCESS - One value`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .send({ label: 'Changed label' + Math.floor(Math.random() * 1000) })
                .expect(200)
                .end((err, res) => {
                    deleteOU(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`OU-PATCH SUCCESS - All values`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .send({ label: 'NVS2 4BHIF' + Math.floor(Math.random() * 1000), description: 'NVS Gruppe 1' })
                .expect(200)
                .end((err, res) => {
                    deleteOU(id)
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`OU-PATCH ERROR - Invalid id`, function (done) {
        let id = -1;
        request(app)
            .patch(`/api/v1/ou/${id}`)
            .set({ Authorization: token })
            .send({ label: 'NewTestOU' + Math.floor(Math.random() * 1000), description: 'NVS Gruppe 1' })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`OU-PATCH ERROR - Invalid property`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .send({ name: 'TestOU' + Math.floor(Math.random() * 1000) })
                .expect(400)
                .end((err, res) => {
                    deleteOU(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`OU-PATCH ERROR - Too many arguments`, function (done) {
        createOU((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .send({ label: 'TestOU' + Math.floor(Math.random() * 1000), description: 'Gruppe 1', numOfPupils: '19' })
                .expect(400)
                .end((err, res) => {
                    deleteOU(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    //#endregion
    //#region Delete
    it(`OU-DELETE SUCCESS - One OU`, function (done) {
        createOU((err, id) => {
            if (err) {
                return done(err);
            }
            request(app)
                .delete(`/api/v1/ou/${id}`)
                .set({ Authorization: token })
                .expect(204)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`OU-DELETE ERROR - Not found`, function (done) {
        let id = -1;
        request(app)
            .delete(`/api/v1/ou/${id}`)
            .set({ Authorization: token })
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion

    deletePeriod(periodIdForOUs);
});


function deleteUser(id) {
    request(app)
        .delete(`/api/v1/users/${id}`)
        .set({ Authorization: token })
        .end((err, res) => {
            if (err)
                assert.fail(err);
        });
}

function deletePeriod(id) {
    request(app)
        .delete(`/api/v1/periods/${id}`)
        .set({ Authorization: token })
        .end((err, res) => {
            if (err)
                assert.fail(err);
        });
}

function deleteOU(id) {
    request(app)
        .delete(`/api/v1/ou/${id}`)
        .set({ Authorization: token })
        .end((err, res) => {
            if (err)
                assert.fail(err);
        });
}

function createPeriod(callback, label) {
    let id;
    if (!label) {
        label = 'TestPeriod' + Math.floor(Math.random() * 1000)
    }
    request(app)
        .post(`/api/v1/periods`)
        .set({ Authorization: token })
        .send({
            label: label,
            from: "2020-03-26",
            till: "2022-07-30",
            active: false,
            archived: false
        })
        .end((err, res) => {
            if (!res.body.id) {
                assert.fail('Period creation failed');
            }
            callback(err, res.body.id);
        });
}

function createRandomUser(callback) {
    request(app)
        .post('/api/v1/users/')
        .send({
            username: 'RandUser' + Math.floor(Math.random() * 1000),
            password: '0000',
            active: false
        })
        .end((err, res) => {
            if (err)
                assert.fail(err);
            if (!res.body.id)
                assert.fail('Beforehand user generation failed!');
            callback(err, res.body.id);
        });
}

function createOU(callback) {
    createPeriod((err, id) => {
        if (err)
            return done(err);  
        request(app)
            .post('/api/v1/ou/')
            .set({ Authorization: token })
            .send({ 
                label: 'TestOU' + Math.floor(Math.random() * 1000), 
                description: 'This is my test OU!' 
            })
            .end((err, res) => {
                if (err)
                    assert.fail(err);
                if (!res.body.id)
                    assert.fail('Beforehand OU generation failed!');
                callback(err, res.body.id);
                deletePeriod(id);
            });
    });
}