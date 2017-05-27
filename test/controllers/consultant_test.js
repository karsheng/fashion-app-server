const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const Item = require('../../models/item');
const Recommendation = mongoose.model('recommendation');

describe('Consultant controller', (suite) => {
	var consultant, client;
	beforeEach((done) => {
		request(app)
			.post('/consultant/signup')
			.send({
				email: 'davidbeckham@gmail.com',
				password: 'qwerty123',
				name: 'David Beckham',
				username: 'davidbeckham'
			})
			.end((err, res) => {
				consultant = res.body;
				request(app)
					.post('/signup')
					.send({
						email: 'joe@gmail.com',
						password: 'qwerty123',
						name: 'Joe',
						username: 'joe'								
					})
					.end((err, res) => {
						client = res.body;	
						done()
					});
			});
	});

	it('saves a recommendation to user', (done) => {
		const dress = new Item({
			name: 'Blue Dress',
			description: 'Dark Blue Dress',
			price: 129
		});
		dress.save()
			.then(() => {
				request(app)
					.post('/consultant/recommendation')	
					.set('consultant-authorization', consultant.token)
					.send({
						item_id: dress._id,
						client_id: client._id,
						notes: "This looks great on you!"
					})
					.end((err, response) => {
						Recommendation.findById(response.body)
							.populate({
								path: 'consultant',
								model: 'user'
							})
							.populate({
								path: 'client',
								model: 'user'
							})
							.populate({
								path: 'item',
								model: 'item'
							})
							.then(rec => {
								assert(rec.consultant.name === 'David Beckham');
								assert(rec.client.name === 'Joe');
								assert(rec.item.name === 'Blue Dress');
								done();
							});
					});
			});		
	}); 
});