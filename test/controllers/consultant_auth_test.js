const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

const User = mongoose.model('user');

describe('Consultant Authentication Controller', () => {
	it('post to /consultant/signup creates a consultant', (done) => {
		request(app)
			.post('/consultant/signup')
			.send({
				email: 'davidbeckham@gmail.com',
				password: 'qwerty123',
				name: 'David Beckham',
				username: 'davidbeckham'
			})
			.end(() => {
				User.findOne({ username: 'davidbeckham' })
					.then((user) => {
						const Consultant = mongoose.model('consultant');
						Consultant.findOne({ profile: user._id})
							.then((consultant) => {
								assert(user.name === 'David Beckham');		
								assert(user.isConsultant === true);
								assert(consultant.profile.toString() === user._id.toString());
								done();
							});
					});
			});
	});

	it('post to /consultant/signin receives a auth token (localSignin)', (done) => {
		request(app)
			.post('/consultant/signup')
			.send({
				email: 'davidbeckham@gmail.com',
				password: 'qwerty123',
				name: 'David Beckham',
				username: 'davidbeckham'
			})
			.end(() => {
				request(app)
					.post('/consultant/signin')
					.send({
						email: 'davidbeckham@gmail.com',
						password: 'qwerty123'
					})
					.end((err, res) => {
						assert(res.body.token);
						done();
					});
			});
	});

	it('rejects when signing up with same username', (done) => {
		request(app)
			.post('/consultant/signup')
			.send({
				email: 'davidbeckham@gmail.com',
				password: 'qwerty123',
				name: 'David Beckham',
				username: 'davidbeckham'
			})
			.end((err, res) => {
				request(app)
					.post('/signup')
					.send({
						email: 'davidbeckham2@gmail.com',
						password: 'qwerty1234',
						name: 'David Beckham Too',
						username: 'davidbeckham'
					})
					.end((err, res) => {
						assert(res.body.error === 'Username is in use');
						done();
					});
			});
	});

	it('rejects when signing up with same email', (done) => {
		request(app)
			.post('/consultant/signup')
			.send({
				email: 'davidbeckham@gmail.com',
				password: 'qwerty123',
				name: 'David Beckham',
				username: 'davidbeckham'
			})
			.end((err, res) => {
				request(app)
					.post('/signup')
					.send({
						email: 'davidbeckham@gmail.com',
						password: 'qwerty1234',
						name: 'Not David Beckham',
						username: 'notdavidbeckham'
					})
					.end((err, res) => {
						assert(res.body.error === 'Email is in use');
						done();
					});
			});
	});	

	it('rejects with status 401 when signing in to /signin', (done) => {
		request(app)
			.post('/consultant/signup')
			.send({
				email: 'davidbeckham@gmail.com',
				password: 'qwerty123',
				name: 'David Beckham',
				username: 'davidbeckham'
			})
			.end((err, res) => {
				request(app)	
					.post('/signin')
					.send({
						email: 'davidbeckham@gmail.com',
						password: 'qwerty123',
					})
					.end((err, res) => {
						assert(res.status === 401);
						done();
					});
			});
	});

	it('rejects a existing username owned by a client', (done) => {
		request(app)
			.post('/signup')
			.send({
				email: 'karshenglee@gmail.com',
				password: 'qwerty123',
				name: 'Lee Kar Sheng',
				username: 'karsheng'
			})
			.end(() => {
				request(app)
					.post('/consultant/signup')
					.send({
						email: 'davidbeckham@gmail.com',
						password: 'qwerty123',
						name: 'David Beckham',
						username: 'karsheng'
					})
					.end((err, res) => {
						assert(res.status === 422);
						assert(res.body.error === 'Username is in use');
						done();
					});
			});
	});
});