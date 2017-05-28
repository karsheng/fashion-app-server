const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const createConsultant = require('../create_consultant_helper');
const createClient = require('../create_client_helper');

describe('Client Controller addItemToBag', function(done) {
	this.timeout(20000);
	var consultant, client;

	beforeEach(done => {
		Promise.all([
			createConsultant(), 
			createClient(),
			])	
			.then(results => {
				consultant = results[0];
				client = results[1];
				done();
			});
	});

	it.only('POST to /review/:consultant_id saves a review on consultant', done => {
		request(app)
			.post(`/reviews/${consultant._id}`)
			.set('client-authorization', client.token)
			.send({
				client: client._id,
				consultant: consultant._id,
				rating: 4,
				comment: 'Great consultant!'
			})
			.end((err, res) => {
				assert(res.body.rating === 4);
				assert(res.body.comment === 'Great consultant!');
				done();
			});
	});
});