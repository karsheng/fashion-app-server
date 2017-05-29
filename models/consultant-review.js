const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Consultant = require('./consultant');

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

ConsultantReviewSchema.post('save', function(next) {
	const review = this;
	const model = mongoose.model('consultant-review');

	model.aggregate([
		{ $match: { consultant: review.consultant } },

		{ '$group': 
			{ _id: review.consultant,
				'avgRating': {'$avg': '$rating'}
			}
		}
	], function(err, result) {
		const con = result[0];
		Consultant
			.findOneAndUpdate(
				{ profile: con._id }, 
				{ rating: con.avgRating },
				{ new: true }
			)
			.then(next)
			.catch(next);
	});
});

const ConsultantReview = mongoose.model('consultant-review', ConsultantReviewSchema);


module.exports = ConsultantReview;