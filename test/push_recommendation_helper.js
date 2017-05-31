const request = require('supertest');
const app = require('../app');

module.exports = (consultant, rec_id) => {
	return new Promise((resolve, reject) => {
	
		request(app)
			.put(`/consultant/recommendation/push/${rec_id}`)
			.set('consultant-authorization', consultant.token)
			.end((err, res) => {
				resolve(res.body);
			});
	});
}