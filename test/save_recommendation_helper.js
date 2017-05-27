const request = require('supertest');
const app = require('../app');

module.exports = (consultant, client, item, notes) => {
	return new Promise((resolve, reject) => {
	const rec = {
			client_id: client._id,
			item_id: item._id,
			notes: notes
		};

		request(app)
			.post('/consultant/recommendation')
			.set('consultant-authorization', consultant.token)
			.send(rec)
			.end((err, res) => {
				resolve(res.body);
			});
	});
}