const request = require('supertest');
const faker = require('faker');
const app = require('../app');
const ConsultantReview = require('../models/consultant-review');

module.exports = (client, consultant) => {
	return new Promise((resolve, reject) => {
		const fakeReview =  new ConsultantReview({
				client: client._id,
				consultant: consultant._id,
				rating: 3,
				comment: faker.lorem.sentences()
			});

			fakeReview.save()
				.then(review => resolve(review));
	});
}

