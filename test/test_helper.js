const mongoose = require('mongoose');

before((done) => {
	mongoose.connect('mongodb://localhost/peach_test');
	mongoose.connection
		.once('open', () => done())
		.on('error', err => {
			console.warn('Warning', error);
		});
});

beforeEach(done => {
	mongoose.connection.db.dropDatabase(function() {
		done();
	});
});