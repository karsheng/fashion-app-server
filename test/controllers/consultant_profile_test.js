const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const CreateConsultant = require('../create_consultant_helper');

describe.only('Consultant Controller Profile', function() {
	var consultant;

	beforeEach(done => {
		CreateConsultant()
			.then(con => {
				consultant = con;
				done();
			});
	});

	it('/PUT to /consultant/profile updates consultant description', done => {
		request(app)
			.put('/consultant/profile')
			.send({ description: 'I am an award-winning consultant!'})
			.set('consultant-authorization', consultant.token)
			.end((err, res) => {
				assert(res.body.description === 'I am an award-winning consultant!')
				done();		
			});
	});
});