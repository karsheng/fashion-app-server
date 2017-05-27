const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const createConsultant = require('../create_consultant_helper');
const createClient = require('../create_client_helper');
const createItem = require('../create_item_helper');
const saveRecommendation = require('../save_recommendation_helper.js');
const pushRecommendation = require('../push_recommendation_helper.js');
const addItemToBag = require('../add_item_to_bag_helper.js');
const faker = require('faker');
const mongoose = require('mongoose');
const Bag = mongoose.model('bag');

describe('Client Controller addItemToBag', function(done) {
	this.timeout(20000);
	var consultant, client;
	var item;
	var note;
	var rec_id;

	beforeEach(done => {
		Promise.all([
			createConsultant(), 
			createClient(),
			createItem(),
			])	
			.then(results => {
				consultant = results[0];
				client = results[1];
				item = results[2];
				note = faker.lorem.sentences();
				saveRecommendation(consultant, client, item, note)
					.then(recid => {
						pushRecommendation(consultant, recid)
							.then(result => {
								rec_id = recid;
								done();
							});
					});
			});
	});

	it('GET to /bag returns all items in bag', done => {
		Promise.all([createItem(), createItem()])
			.then(items => {
				Promise.all([
						saveRecommendation(consultant, client, items[0]),
						saveRecommendation(consultant, client, items[1])
					])
					.then(rec_ids => {
						Promise.all([
								pushRecommendation(consultant, rec_ids[0]),
								pushRecommendation(consultant, rec_ids[1])
							])
							.then(() => {
								Promise.all([
									addItemToBag(client, rec_id, 10),
									addItemToBag(client, rec_ids[0], 25),
									addItemToBag(client, rec_ids[1], 8)
									])
									.then(() => {
										request(app)
											.get('/bag')
											.set('client-authorization', client.token)
											.end((err, res) => {
												assert(res.body.length === 3);
												done();
											});
									});
							});
					});
			});
	});

	it('POST to /bag adds item to bag', done => {
		request(app)
			.post('/bag')
			.set('client-authorization', client.token)
			.send({
				rec_id: rec_id,
				quantity: 10
			})
			.end((err, res) => {
				const bagItem = res.body;

				assert(bagItem.item === item._id.toString());
				assert(bagItem.client === client._id.toString());
				assert(bagItem.recommendedBy === consultant._id.toString());
				assert(bagItem.recommendation === rec_id);
				assert(bagItem.quantity === 10);
				done();		
			});
	});

	it('PUT to /bag updates quantity of item in bag', done => {
			addItemToBag(client, rec_id, 1)
				.then(res => {
					request(app)
						.put('/bag')
						.set('client-authorization', client.token)
						.send({ 
							rec_id: rec_id,
							quantity: 20
						})
						.end((err, res) => {
							assert(res.body.quantity === 20);
							done();		
						});
				});
	});

	it('DELETE to /bag removes item in bag', done => {
			addItemToBag(client, rec_id, 1)
				.then(res => {
					request(app)
						.delete('/bag')
						.set('client-authorization', client.token)
						.send({ 
							rec_id: rec_id,
						})
						.end((err, res) => {
							Bag.findById(res.body._id)
								.then(result => {
									assert(result === null);
									done();
								});
						});
				});
	});

});