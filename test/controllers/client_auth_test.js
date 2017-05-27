const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

const User = mongoose.model('user');

describe('Client Authentication Controller' ,() => {
	it('post to /signup creates a user', (done) => {
		request(app)
			.post('/signup')
			.send({
				email: 'joe@gmail.com',
				password: 'qwerty123',
				name: 'Joe',
				username: 'joe'
			})
			.end((err, res) => {
				User.findOne({ username: 'joe'})
					.then((user) => {
						const Client = mongoose.model('client');
						Client.findOne({ profile: user._id })
							.then((client) => {
								assert(user.name === 'Joe');
								assert(user.isConsultant === false);
								assert(client.profile.toString() === user._id.toString());
								done();
							})
					})
			})
	});

	it('post to /signin receives a auth token (localSignin)', (done) => {
		request(app)
			.post('/signup')
			.send({
					email: 'joe@gmail.com',
					password: 'qwerty123',
					name: 'Joe',
					username: 'joe'
			})
			.end(() => {
				request(app)
					.post('/signin')
					.send({
						email: 'joe@gmail.com',
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
			.post('/signup')
			.send({
					email: 'joe@gmail.com',
					password: 'qwerty123',
					name: 'Joe',
					username: 'joe'
			})
			.end((err, res) => {
				request(app)
					.post('/signup')
					.send({
						email: 'joetoo@gmail.com',
						password: 'qwerty123',
						name: 'Joe Too',
						username: 'joe'
					})
					.end((err, res) => {
						assert(res.body.error === 'Username is in use');
						done();
					});
			});
	});

	it('rejects when signing up with same email', (done) => {
		request(app)
			.post('/signup')
			.send({
				email: 'joe@gmail.com',
				password: 'qwerty123',
				name: 'Joe',
				username: 'joe'
			})
			.end((err, res) => {
				request(app)
					.post('/signup')
					.send({
						email: 'joe@gmail.com',
						password: 'qwerty123',
						name: 'Joe Too',
						username: 'joetoo'
					})
					.end((err, res) => {
						assert(res.body.error === 'Email is in use');
						done();
					});
			});
	});

	it('rejects with status 401 when signing in to /consultant/signin', (done) => {
		request(app)
			.post('/signup')
			.send({
				email: 'joe@gmail.com',
				password: 'qwerty123',
				name: 'Joe',
				username: 'joe'
			})
			.end((err, res) => {
				request(app)	
					.post('/consultant/signin')
					.send({
						email: 'joe@gmail.com',
						password: 'qwerty123',
					})
					.end((err, res) => {
						assert(res.status === 401);
						done();
					});
			});
	});
	it('rejects a existing username owned by a consulant', (done) => {
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
					.post('/consultant/signup')
					.send({
						email: 'karshenglee@gmail.com',
						password: 'qwerty123',
						name: 'Lee Kar Sheng',
						username: 'davidbeckham'
					})
					.end((err, res) => {
						assert(res.status === 422);
						assert(res.body.error === 'Username is in use');
						done();
					});
			});
	});
});