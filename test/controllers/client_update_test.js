const assert = require('assert');
const request = require('supertest');
const app = require('../../app');

const Client = require('../../models/client');
const Category = require('../../models/category');

describe('Updating user records', function() {
	this.timeout(10000);
	var client;
	var hats, shoes, pants, dress;

	beforeEach((done) => {
		request(app)
			.post('/signup')
			.send({
				email: 'karsheng_88@hotmail.com',
				password: 'qwerty123',
				name: 'Lee Kar Sheng',
				username: 'karsheng'
			})
			.end((err, response) => {
				client = response.body;
				hats = new Category({ name: 'hats' });
				shoes = new Category({ name: 'shoes' });
				pants = new Category({ name: 'pants' });
				dress = new Category({ name: 'dress' });

				Promise.all([hats.save(), shoes.save(), pants.save(), dress.save()])
					.then(() => done());
			});
	});

	it('updates user lookingFor', (done) => {
		request(app)
			.put(`/lookingfor/`)
			.set('client-authorization', client.token)
			.send({ lookingFor: ['hats'] })
			.end((err, res) => {
				Client.findOne({ profile: res.body.profile })
					.populate({
						path: 'lookingFor',
						model: 'category'
					})
					.then(returnedUser => {
						assert(returnedUser.lookingFor[0].name === 'hats');
						done();
					});
			});
	});
});