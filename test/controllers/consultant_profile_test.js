const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const CreateConsultant = require('../create_consultant_helper');
const CreateClient = require('../create_client_helper');
const postReview = require('../post_review_helper');
const faker = require('faker');

describe('Consultant Controller Profile', function() {
	this.timeout(15000);
	var consultant, client;

	beforeEach(done => {
		CreateConsultant()
			.then(con => {
				consultant = con;
				CreateClient()
					.then(cli => {
						client = cli;
						postReview(client, consultant, 3)
							.then(() => {
								postReview(client, consultant, 4)
									.then(() => {
										postReview(client, consultant, 5)
											.then(() => {
												done();		
											});
									});
							});	
					});
			});
	});

	it('/PUT to /consultant/profile updates consultant description', done => {
		request(app)
			.put('/consultant/profile')
			.send({ description: 'I am an award-winning consultant!'})
			.set('consultant-authorization', consultant.token)
			.end((err, res) => {
				assert(res.body.description === 'I am an award-winning consultant!')
				done();		
			});
	});

	it('/GET to /consultant/profile/:consultant_id returns consultant profile info', done => {
		request(app)
			.put('/consultant/profile')
			.send({ description: 'I am super consultant!'})
			.set('consultant-authorization', consultant.token)
			.end(() => {
				request(app)
					.get(`/consultant/profile/${consultant._id}`)
					.end((err, res) => {
						const con = res.body;
						assert(con.profile.name === consultant.name);
						assert(con.profile.username === consultant.username);
						assert(con.description === 'I am super consultant!');
						assert(con.rating === 4);
						done();
					})
			});
	});

	it('/PUT to /consultant/profile/imageUrl updates consultant imageUrl', done => {
		request(app)
			.put('/consultant/profile/imageUrl')
			.send({ imageUrl: 'http://test.com/abc.jpg'})
			.set('consultant-authorization', consultant.token)
			.end((err, res) => {
				const con = res.body;
				assert(con.imageUrl === 'http://test.com/abc.jpg');
				done();
			})
	});
});