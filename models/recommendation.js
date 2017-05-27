const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecommendationSchema = new Schema({
	item: {
		type: Schema.Types.ObjectId,
		ref: 'item'
	},
	consultant: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	client: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	notes: {
		type: String
	},
	timeSent: Date,
	sent: {
		type: Boolean,
		default: false
	},
	rating: {
		type: Number,
		min: [1, 'Minimum value is 1'],
		max: [3, 'Maximum value is 3']
	}
});


const Recommendation = mongoose.model('recommendation', RecommendationSchema);

module.exports = Recommendation;

