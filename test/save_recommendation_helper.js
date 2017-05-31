const request = require('supertest');
const app = require('../app');

module.exports = (consultant, client, item, notes) => {
	return new Promise((resolve, reject) => {
	const rec = {
			item_id: item._id,
			notes: notes
		};

		request(app)
			.post(`/consultant/recommendation/save/${client._id}`)
			.set('consultant-authorization', consultant.token)
			.send(rec)
			.end((err, res) => {
				resolve(res.body);
			});
	});
}