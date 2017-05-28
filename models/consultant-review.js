const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConsultantReviewSchema = new Schema({
	client: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	consultant: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	rating: {
		type: Number,
		min: [1, 'Minimum value is 1'],
		max: [5, 'Maximum value is 5']
	},
	comment: {
		type: String
	}
},
	{ timestamps: { createdAt: 'createdAt' } }
);

ConsultantReviewSchema.set('validateBeforeSave', true);

const ConsultantReview = mongoose.model('consultant-review', ConsultantReviewSchema);

module.exports = ConsultantReview;