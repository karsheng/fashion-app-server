const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create user local strategy
const clientLocalOptions = { usernameField: 'email' }
const clientLocalLogin = new LocalStrategy(clientLocalOptions, function(email, password, done) {
	// verify this email and password, call done with the user
	// if it is the correct email and password
	// otherwise, call done with false
	User.findOne({ email: email }, function(err, user) {
		if (err) { return done(err); }
		if (!user) { return done(null, false); }

		// return error message if user is a consultant
		if (user.isConsultant) { return done(null, false) };

		// compare passwords - is 'password' equal to user password
		user.comparePassword(password, function(err, isMatch) {
			if (err) { return done(err); }
			if (!isMatch) { return done(null, false); }

			return done(null, user);
		});
	});

});


// Setup option for user JWT Strategy
const clientJwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('client-authorization'),
	secretOrKey: config.secret
};

// Create user JWT strategy
const clientJwtLogin = new JwtStrategy(clientJwtOptions, function(payload, done){
	// See if the user ID in the payload exists in our database
	// if it does, call 'done' with that user
	// otherwise, call done without user object
	User.findById(payload.sub, function(err, user) {
		// second argument should be user object,
		// but null here since there's an error
		if (err) { return done(err, false); } 

		if (user && !user.isConsultant) {
			done(null, user);
		} else {
			done(null, false);
		}
	});
});

// Create consultant local strategy
const consultantLocalOptions = { usernameField: 'email' }
const consultantLocalLogin = new LocalStrategy(consultantLocalOptions, function(email, password, done) {
	User.findOne({ email: email }, function(err, user) {
		if (err) { return done(err); }
		if (!user) { return done(null, false); }

		// return error message if user is NOT a consultant
		if (!user.isConsultant) { return done(null, false) };

		user.comparePassword(password, function(err, isMatch) {
			if (err) { return done(err); }
			if (!isMatch) { return done(null, false); }

			return done(null, user);
		});
	});

});


// Setup option for consultant JWT Strategy
const consultantJwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('consultant-authorization'),
	secretOrKey: config.consultant_secret
};

// Create consultant JWT strategy
const consultantJwtLogin = new JwtStrategy(consultantJwtOptions, function(payload, done){

	User.findById(payload.sub, function(err, user) {
		
		if (err) { return done(err, false); } 

		if (user && user.isConsultant) {
			done(null, user);
		} else {
			done(null, false);
		}
	});
});


// Tell passport to use this strategy
passport.use('client-jwt', clientJwtLogin);
passport.use('client-local',clientLocalLogin);
passport.use('consultant-jwt', consultantJwtLogin);
passport.use('consultant-local', consultantLocalLogin);