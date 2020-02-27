/**
 * Http tests for http testing
 */

const assert = require('assert');
const http = require('http');
const app = require('../server');
const request = require('supertest');

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

// TODO: Too less properties test
describe(`Testing Users API`, function () {
    /**
     * GET
     */
    it(`GET SUCCESS - All users`, function (done) {
        request(app)
            .get('/api/users/id')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`GET SUCCESS - One user`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .get(`/api/users/${id}`)
                .expect(200)
                .end((err, res) => {
                    deleteUser(id);
                    if (err) 
                    	return done(err);
                    done();
                });
        });
    });
    it(`GET ERROR - Invalid id`, function (done) {
        request(app)
            .get('/api/users/d290f1ee-6c54-4b01-90e6-d701748fffff')
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    /**
     * POST
     */
    it(`POST SUCCESS`, function (done) {
        request(app)
            .post('/api/users/')
            .send({ username: 'CoolGuy', password: '123', email: 'co@ol.guy' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`POST ERROR - Already exists`, function (done) {
        request(app)
            .post('/api/users/')
            .send({ username: 'CoolGuy', password: '123', email: 'co@ol.guy' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`POST ERROR - Wrong property`, function (done) {
        request(app)
            .post('/api/users/')
            .send({ name: 'CoolGuy', password: '123', email: 'co@ol.guy' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`POST ERROR - Too many properties`, function (done) {
        request(app)
            .post('/api/users/')
            .send({ username: 'CoolGuy', password: '123', email: 'co@ol.guy', age: 17 })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    /**
     * PUT
     */
    it(`PUT SUCCESS`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/users/${id}`)
                .send({ username: 'OverWrite', password: '1234', email: 'invalid@e.mail' })
                .expect(200)
                .end((err, res) => {
                    deleteUser(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PUT ERROR - Invalid id`, function (done) {
        request(app)
            .put(`/api/users/d290f1ee-6c54-4b01-90e6-d701748fffff`)
            .send({ username: 'ErrorWriteId', password: 'error', email: 'error@should-not.work' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PUT ERROR - Invalid property`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/users/${id}`)
                .send({ name: 'ErrorWriteProp', password: 'error', email: 'error@should-not.work' })
                .expect(400)
                .end((err, res) => {
                    deleteUser(id);
                    if (err) 
                    	return done(err);
                    done();
                });
        });
    });
    it(`PUT ERROR - Too many arguments`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/users/${id}`)
                .send({ username: 'ErrorWriteArgs', password: 'error', email: 'error@should-not.work', age: 17 })
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
    it(`PATCH SUCCESS - One value`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/users/${id}`)
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
    it(`PATCH SUCCESS - All values`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/users/${id}`)
                .send({ username: 'OverPatchAll', password: '1234', email: 'over@patchworks.com' })
                .expect(200)
                .end((err, res) => {
                    deleteUser(id);
                    if (err) 
                    	return done(err);
                    done();
                });
        });
    });
    it(`PATCH ERROR - Invalid id`, function (done) {
        request(app)
            .patch(`/api/users/d290f1ee-6c54-4b01-90e6-d701748fffff`)
            .send({ username: 'PatchWritePatch', password: 'error', email: 'error@should-not.work' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PATCH ERROR - Invalid property`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/users/${id}`)
                .send({ name: 'PatchWriteProp', password: 'error', email: 'error@should-not.work' })
                .expect(400)
                .end((err, res) => {
                    deleteUser(id);
                    if (err) 
                    	return done(err);
                    done();
                });
        });
    });
    it(`PATCH ERROR - Too many arguments`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/users/${id}`)
                .send({ username: 'PatchWriteArgs', password: 'error', email: 'error@should-not.work', age: 17 })
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
    it(`DELETE SUCCESS`, function (done) {
        createRandomUser((err, id) => {
            if (err)
                return done(err);
            request(app)
                .delete(`/api/users/${id}`)
                .expect(204)
                .end((err, res) => {
                    if (err) 
                    	return done(err);
                    done();
                });
        });
    });
    it(`DELETE ERROR - Invalid id`, function (done) {
        request(app)
            .delete(`/api/users/d290f1ee-6c54-4b01-90e6-d701748fffff`)
            .send({ username: 'PatchWritePatch', password: 'error', email: 'error@should-not.work' })
            .expect(400)
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
                    deletePeriod(id)
                    if (err) return done(err);
                    done();
                });
        })

    });
    it(`GET ONE ERROR - One period; not found`, function (done) {
        //TODO: CREATE ONE PERIOD FIRST
        let id = -1;
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
        let idToDelete;
        request(app)
            .post(`/api/periods`)
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
            .expect(201)
            .end((err, res) => {
                deletePeriod(id);
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
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        }, label);
    });
    it(`POST ONE ERROR - Wrong amount of arguments`, function (done) {
        request(app)
            .post(`/api/periods`)
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000) })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`POST ONE ERROR - Wrong agruments`, function (done) {
        request(app)
            .post(`/api/periods`)
            .send({ name: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    //#endregion
    //#region Put
    it(`PUT SUCCESS`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/periods/${id}`)
                .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
                .expect(200)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PUT ERROR - Not found`, function (done) {
        let id = -1;
        request(app)
            .put(`/api/periods/${id}`)
            .send({ label: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PUT ERROR - Invalid property`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/periods/${id}`)
                .send({ name: 'TestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
                .expect(400)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PUT ERROR - Too many arguments`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .put(`/api/periods/${id}`)
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
    it(`PATCH SUCCESS - One value`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/periods/${id}`)
                .send({ label: 'NewTestPeriod' + Math.floor(Math.random() * 1000)})
                .expect(200)
                .end((err, res) => {
                    deletePeriod(id)
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PATCH SUCCESS - All values`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/periods/${id}`)
                .send({ label: 'NewTestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
                .expect(200)
                .end((err, res) => {
                    deletePeriod(id)
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PATCH ERROR - Invalid id`, function (done) {
        let id = -1;
        request(app)
            .patch(`/api/periods/${id}`)
            .send({ label: 'NewTestPeriod' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
    it(`PATCH ERROR - Invalid property`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/periods/${id}`)
                .send({ name: 'shouldNotWork' + Math.floor(Math.random() * 1000), from: new Date('2020-27-02'), till: new Date('2022-27-03') })
                .expect(400)
                .end((err, res) => {
                    deletePeriod(id);
                    if (err) return done(err);
                    done();
                });
        });
    });
    it(`PATCH ERROR - Too many arguments`, function (done) {
        createPeriod((err, id) => {
            if (err)
                return done(err);
            request(app)
                .patch(`/api/periods/${id}`)
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

function deleteUser(id) {
	request(app)
		.delete(`/api/users/${id}`)
		.end((err, res) => {
			if (err) 
				assert.fail(err);
		}); 
}

function deletePeriod(id) {
    request(app)
        .delete(`/api/periods/${id}`)
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

function createRandomUser(callback) {
    request(app)
        .post('/api/users/')
        .send({
            username: 'RandUser' + Math.floor(Math.random() * 1000),
            password: '0000',
            email: 'user@random.org'
        })
        .end((err, res) => {
            if (err)
                assert.fail(err);
            if (!res.body.id)
                assert.fail('Beforehand user generation failed!');
            callback(err, res.body.id);
        });
}
