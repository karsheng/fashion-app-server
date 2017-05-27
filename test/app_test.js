const assert = require('assert');
const request = require('supertest');
const app = require('../app');

describe('The express app', () => {
	it('handles a GET request to /', (done) => {
		request(app)
			.get('/')
			.end((err, response) => {
				assert(response.body.hi === 'there');
				done();
			}); 
	});
});