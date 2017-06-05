const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
	name: String,
	description: String,
	price: Number,
	images: [String]
});

const Item = mongoose.model('item', ItemSchema);

module.exports = Item;