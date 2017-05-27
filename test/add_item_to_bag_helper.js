const request = require('supertest');
const app = require('../app');

module.exports = (client, rec_id, quantity) => {
	return new Promise((resolve, reject) => {
	
		request(app)
			.post('/bag')
			.set('client-authorization', client.token)
			.send({
				rec_id: rec_id,
				quantity: quantity
			})
			.end((err, res) => {
				resolve(res.body);
			});
	});
}