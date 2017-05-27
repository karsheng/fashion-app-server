const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mocha = require('mocha');
const Item = require('../../models/item');
const Recommendation = require('../../models/recommendation');

describe('Consultant Controller', function() {
	this.timeout(10000);
	var consultant, client;

	beforeEach(done => {
		request(app)
			.post('/consultant/signup')
			.send({
				name: 'David Beckham',
				username: 'davidbeckham',
				password: 'qwerty123',
				email: 'davidbeckham@gmail.com'
			})
			.end((err, res) => {
				consultant = res.body;
				request(app)
					.post('/signup')
					.send({
						name: 'Lee Kar Sheng',
						username: 'karsheng',
						password: 'qwerty123',
						email: 'karshenglee@gmail.com'
					})
					.end((err, res) => {
						client = res.body;
						done();		
					});
			});
	});

	it('PUT to /consultant/recommendation/pushall recommendation to clients', done => {
		var dress = new Item({
			name: 'Dress',
			description: 'Blue Dress',
			price: 199
		});

		var shirt = new Item({
			name: 'Shirt',
			description: 'Blue Shirt',
			price: 299
		});

		Promise.all([dress.save(), shirt.save()])
			.then(() => {
				const rec1 = new Recommendation({
					item: dress._id,
					consultant: consultant._id,
					client: client._id,
					notes: 'This looks great on you!'
				});
				const rec2 = new Recommendation({
					item: shirt._id,
					consultant: consultant._id,
					client: client._id,
					notes: 'This is a beautiful pants!'
				});

				Promise.all([rec1.save(), rec2.save()])
					.then(() => {
						request(app)
							.put('/consultant/recommendation/pushall')
							.set('consultant-authorization', consultant.token)
							.send({ client_id: client._id })
							.end((err, res) => {
								Recommendation.find({
									_id: { $in: [rec1._id, rec2._id] }
								})
								.then(results => {
									assert(results[0].sent === true);
									assert(results[1].sent === true);
									done();
								});
							});
					});
			});
	});	
it('PUT to /consultant/recommendation/push change sent to true and update timeSent with sent time', done => {
		var dress = new Item({
			name: 'Dress',
			description: 'Blue Dress',
			price: 199
		});

		Promise.all([dress.save()])
			.then(() => {
				const rec1 = new Recommendation({
					item: dress._id,
					consultant: consultant._id,
					client: client._id,
					notes: 'This looks great on you!'
				});
				Promise.all([rec1.save()])
					.then(() => {
						request(app)
							.put('/consultant/recommendation/push')
							.set('consultant-authorization', consultant.token)
							.send({ rec_id: rec1._id })
							.end((err, res) => {
								Recommendation.find({
									_id: { $in: rec1._id }
								})
								.then(result => {
									assert(result[0].timeSent);
									assert(result[0].sent === true);
									done();
								});
							});
					});
			});
	});		
});