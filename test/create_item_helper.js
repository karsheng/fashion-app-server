const request = require('supertest');
const faker = require('faker');
const app = require('../app');
const Item = require('../models/item');

module.exports = () => {
	return new Promise((resolve, reject) => {
		const fakeItem =  new Item({
				name: faker.commerce.productName(),
				description: faker.commerce.productAdjective(),
				price: faker.commerce.price(),
				image: [faker.image.fashion(), faker.image.fashion(), faker.image.fashion(), faker.image.fashion()]
			});

			fakeItem.save()
			.then(item => resolve(item));
	});
}

