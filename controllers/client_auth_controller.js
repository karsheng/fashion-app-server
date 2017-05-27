const jwt = require('jwt-simple');
const User = require('../models/user');
const Client = require('../models/client');
const config = require('../config');


function tokenForUser(user) {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: user._id, iat: timestamp }, config.secret);
}

module.exports = {
	signin (req, res, next) {
		// User has already had their email and password auth'd
		// We just need to give them a token
		res.send({ token: tokenForUser(req.user), _id: req.user._id }); 
	},

	signup (req, res, next) {
		const email = req.body.email;
		const password = req.body.password;
		const name = req.body.name;
		const username = req.body.username;

		if (!email || !password || !name || !username) {
			return res.status(422).send({ error: 'You must provide email, password, username, and name' })
		}

		// TODO: email, username and password validation

		// see if a user with a given email exists
		User.findOne({ email: email }, function(err, existingUser) {
			if (err) { return next(err); }

			// if a user with email does exist, return an error
			if (existingUser) {
				return res.status(422).send({ error: 'Email is in use' }); //unprocessable entity
			}

			User.findOne({ username: username }, function(err, existingUser) {
				if (err) {return next(err); }
				if (existingUser) {
					return res.status(422).send({ error: 'Username is in use' });		
				}
				// if a user with email and username does not exit, create and save user record
				const user = new User({
					email: email,
					password: password,
					name: name,
					username: username
				});

				user.save(function(err) {
					if (err) { return next(err); }

					const client = new Client({ profile: user._id });

					client.save(function(err) {
						if (err) { return next(err); }
						// respond to request indicating the user was created		
						res.json({ 
							token: tokenForUser(user),
							_id: user._id 
						});	
					});
				});				
			});
		});
	}
};