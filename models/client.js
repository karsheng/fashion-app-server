const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
	profile: {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	wantsRecommendation: { type: Boolean },
	lookingFor: [{
		type: Schema.Types.ObjectId,
		ref: 'category'
	}]
});

const Client = mongoose.model('client', ClientSchema);

module.exports = Client;