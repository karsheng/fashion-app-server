const request = require('supertest');
const faker = require('faker');
const app = require('../app');

module.exports = () => {
	return new Promise((resolve, reject) => {
	const fakerProfile = {
			name: faker.name.findName(),
			email: faker.internet.email(),
			password: 'qwerty123',
			username: faker.internet.userName()
		};

		request(app)
			.post('/signup')
			.send(fakerProfile)
			.end((err, res) => {
				fakerProfile.token = res.body.token;
				fakerProfile._id = res.body._id;
				resolve(fakerProfile);
			});
	});
}