const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define model
const ConsultantSchema = new Schema({
	profile: {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	}
});

// Create the model class
const Consultant = mongoose.model('consultant', ConsultantSchema);

// Export the model
module.exports = Consultant;