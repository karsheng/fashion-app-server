const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BagSchema = new Schema({
	client: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	recommendedBy: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	item: {
		type: Schema.Types.ObjectId,
		ref: 'item'
	},
	quantity: Number,
	recommendation: {
		type: Schema.Types.ObjectId,
		ref: 'recommendation'
	}
});

const Bag = mongoose.model('bag', BagSchema);

module.exports = Bag;
