const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const Item = require('../../models/item');
const Recommendation = mongoose.model('recommendation');
const createRec = require('../create_recommendation_helper');
const PushRec = require('../push_recommendation_helper');
const CreateItem = require('../create_item_helper');

describe('Consultant Controller Recommendation Test', function() {
	this.timeout(15000);
	var consultant, client, item;
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
						CreateItem()
							.then(i => {
								item = i;
								done();		
							});
					});
			});
	});

	it('GET to /consultant/recommendation/:rec_id returns specific rec', done => {
		createRec(consultant, client, item, "Great Item!")
			.then(rec => {
				PushRec(consultant, rec._id)
					.then(rec => {
						request(app)
							.get(`/consultant/recommendation/${rec._id}`)
							.set('consultant-authorization', consultant.token)
							.end((err, res) => {
								assert(res.body._id === rec._id);
								assert(res.body.client.name === 'Joe');
								assert(res.body.notes === 'Great Item!');
								done();		
							});
					});
			});
	});

	it('/POST to /consultant/recommendation/:client_id saves a recommendation to user', (done) => {
		const dress = new Item({
			name: 'Blue Dress',
			description: 'Dark Blue Dress',
			price: 129
		});
		dress.save()
			.then(() => {
				request(app)
					.post(`/consultant/recommendation/${client._id}`)	
					.set('consultant-authorization', consultant.token)
					.send({
						item_id: dress._id,
						notes: "This looks great on you!"
					})
					.end((err, res) => {
						Recommendation.findById(res.body._id)
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

	it('PUT to /consultant/recommendation/:rec_id updates recommendation', done => {
		createRec(consultant, client, item, "I have a feeling that this what you're looking for!")
			.then(rec => {
				request(app)
					.put(`/consultant/recommendation/${rec._id}`)
					.set('consultant-authorization', consultant.token)
					.send({ notes: "oh my god!"})
					.end((err, res) => {
						assert(res.body._id === rec._id);
						assert(res.body.notes === 'oh my god!');
						done();		
					});
			});		
	});

});