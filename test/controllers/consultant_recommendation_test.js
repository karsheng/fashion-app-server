const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const Item = require('../../models/item');
const Recommendation = mongoose.model('recommendation');
const createRec = require('../create_recommendation_helper');
const PushRec = require('../push_recommendation_helper');
const CreateItem = require('../create_item_helper');
const CreateConsultant = require('../create_consultant_helper');

describe('Consultant Controller Recommendation Test', function() {
	this.timeout(15000);
	var consultant, client, item, item2;
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
						Promise.all([CreateItem(), CreateItem()])
						.then(items => {
							item = items[0];
							item2 = items[1];
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

	it('GET to /consultant/recommendation/all/:client_id returns all recs for the particular client', done => {

		CreateConsultant().then(con2 => {
			Promise.all([
				createRec(consultant, client, item, "Consultant rec"),
				createRec(con2, client, item, "Shouldn't see this"),
				createRec(consultant, client, item, "Consultant rec 2")
			])
			.then(recs => {
				request(app)
					.get(`/consultant/recommendation/all/${client._id}`)
					.set('consultant-authorization', consultant.token)
					.end((err, res) => {
						assert(res.body.length === 2);
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

	it('DELETE to /consultant/recommendaiton/:rec_id removes a recommendation', done => {
		createRec(consultant, client, item, "I have a feeling that this what you're looking for!")
			.then(rec => {
				request(app)
					.delete(`/consultant/recommendation/${rec._id}`)
					.set('consultant-authorization', consultant.token)
					.end((err, res) => {
						Recommendation.findById(res.body._id)
							.then(rec => {
								assert(rec === null);
								done();		
							});
					});
			});			
	});

});