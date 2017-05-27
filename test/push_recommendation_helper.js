const request = require('supertest');
const app = require('../app');

module.exports = (consultant, rec_id) => {
	return new Promise((resolve, reject) => {
	
		request(app)
			.put('/consultant/recommendation/push')
			.set('consultant-authorization', consultant.token)
			.send({ rec_id: rec_id })
			.end((err, res) => {
				resolve(res.body);
			});
	});
}