const jwt = require('jwt-simple');
const User = require('../models/user');
const Consultant = require('../models/consultant');
const config = require('../config');


function tokenForConsultant(consultant) {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: consultant._id, iat: timestamp }, config.consultant_secret);
}

module.exports = {
	signin (req, res, next) {
		// return token
		res.send({ token: tokenForConsultant(req.user), _id: req.user._id }); 
	},

	signup (req, res, next) {
		const email = req.body.email;
		const password = req.body.password;
		const name = req.body.name;
		const username = req.body.username;

		if (!email || !password || !name || !username) {
			return res.status(422).send({ error: 'You must provide email, password, name and username' })
		}

		// TODO: email and password validation

		// see if a consultant with a given email exists
		User.findOne({ email: email }, function(err, existingUser) {
			if (err) { return next(err); }

			// if a consultant with email does exist, return an error
			if (existingUser) {
				return res.status(422).send({ error: 'Email is in use' }); //unprocessable entity
			}

			User.findOne({ username: username }, function(err, existingUser) {
				if (err) { return next(err); }
				if (existingUser) {
					return res.status(422).send({ error: 'Username is in use' });
				}
				// if a consultant with email does not exit, create and save user record
				const user = new User({
					email: email,
					password: password,
					name: name,
					username: username,
					isConsultant: true
				});
				user.save(function(err) {
					if (err) { return next(err); }

					const consultant = new Consultant({ profile: user._id });

					consultant.save(function(err) {
						if (err) { return next(err); }
						// respond to request indicating the consultant was created		
						res.json({ 
							token: tokenForConsultant(user),
							_id: user._id 
						});
					});
				});
			});
		});
	}
};