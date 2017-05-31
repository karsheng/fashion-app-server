const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const createConsultant = require('../create_consultant_helper');
const createClient = require('../create_client_helper');
const createItem = require('../create_item_helper');
const createRecommendation = require('../create_recommendation_helper.js');
const pushRecommendation = require('../push_recommendation_helper.js');
const faker = require('faker');

describe('Client Controller', function(done) {
	this.timeout(15000);
	var consultant_1, consultant_2, consultant_3, client;
	var item1, item2, item3, item4;
	var note1, note2, note3, note4;
	var rec_id1, rec_id2, rec_id3, rec_id4;
	beforeEach(done => {
		Promise.all([
			createConsultant(), 
			createConsultant(), 
			createConsultant(),
			createClient(),
			createItem(),
			createItem(),
			createItem(),
			createItem(),
			])
			.then(results => {
				consultant_1 = results[0];
				consultant_2 = results[1];
				consultant_3 = results[2];
				client = results[3];
				item1 = results[4];
				item2 = results[5];
				item3 = results[6];
				item4 = results[7];
				note1 = faker.lorem.sentences();
				note2 = faker.lorem.sentences();
				note3 = faker.lorem.sentences();
				note4 = faker.lorem.sentences();
				Promise.all([
					createRecommendation(consultant_1, client, item1, note1),
					createRecommendation(consultant_2, client, item2, note2),
					createRecommendation(consultant_3, client, item3, note3),
					createRecommendation(consultant_1, client, item4, note4)
				])
					.then(recs => {
						rec_id1 = recs[0]._id;
						rec_id2 = recs[1]._id;
						rec_id3 = recs[2]._id;
						rec_id4 = recs[3]._id;
						Promise.all([
							pushRecommendation(consultant_1, rec_id1),
							pushRecommendation(consultant_2, rec_id2),
							pushRecommendation(consultant_3, rec_id3),
							pushRecommendation(consultant_1, rec_id4),
						])
							.then(results => {
								done();
							});
					});	
			});
	});

	it('GET request to /recommendations returns recommendations from all consultants', done => {
		request(app)
			.get('/recommendations')
			.set('client-authorization', client.token)
			.end((err, res) => {
				assert(res.body.length === 4);					
				done();
			});
	});

	it('GET request to /recommendations/:consultant_id returns recommendations from specific consultant', done => {
		request(app)
			.get(`/recommendations/${consultant_1._id}`)
			.set('client-authorization', client.token)
			.end((err, res) => {
				assert(res.body.length === 2);
				done();
			});
	});

	it('PUT to /recommendation rates recommendation', done => {
		request(app)
			.put('/recommendation')
			.set('client-authorization', client.token)
			.send({
				rec_id: rec_id1,
				rating: 2
			})
			.end((err, res) => {
				assert(res.body.rating === 2);
				done();
			});
	});
});
