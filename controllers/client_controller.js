const mongoose = require('mongoose');
const Client = require('../models/client');
const Category = require('../models/category');
const Recommendation = require('../models/recommendation');
const Bag = require('../models/bag');
const ConsultantReview = require('../models/consultant-review');

module.exports = {
	updateLookingFor(req, res, next) {
		const client_id  = req.user._id;
		const { lookingFor } = req.body;

		Category.find({ name: { $in: lookingFor } })
			.then(categories => {
				Client.findOneAndUpdate({ profile: client_id }, { lookingFor: categories })
					.then(() => Client.findOne({ profile: client_id }))
					.then((client) => res.send(client))
					.catch(next);
			})
			.catch(next);
	},
	getRecommendations(req, res, next) {
		const client_id = req.user._id;

		Recommendation
			.find({ $and: [{ client: client_id }, {sent: true}] })
			.sort({ timeSent: -1 })
			.populate({ path: 'consultant', select: 'name username', model: 'user' })
			.populate({ path: 'item', model: 'item' })
			.limit(10)
			.then(results => res.send(results))
			.catch(next);
	},
	getRecommendationsByConsultantId(req, res, next) {
		const client_id = req.user._id;
		const consultant_id = req.params.consultant_id;

		Recommendation
			.find({ $and: [{ client: client_id }, { consultant: consultant_id }, {sent: true}] })
			.sort({ timeSent: -1 })
			.populate({ path: 'consultant', select: 'name username', model: 'user' })
			.populate({ path: 'item', model: 'item' })
			.limit(10)
			.then(results => res.send(results))
			.catch(next);
	},
	rateRecommendation(req, res, next) {
		const { rec_id, rating } = req.body;

		Recommendation
			.findByIdAndUpdate(
				rec_id,
				{ rating: rating },
				{ new: true, runValidators: true }
			)
			.then(rec => res.send(rec))
			.catch(err => next(err.errors['rating']));
	},
	getItemsInBag(req, res, next) {
		const client_id = req.user._id;

		Bag.find({ client: client_id })
			.populate({ path: 'item', model: 'item' })
			.populate({ path: 'recommendedBy', select: 'name username', model: 'user'})
			.then(items => res.send(items))
			.catch(next);
	},
	addItemToBag(req, res, next) {
		const client_id = req.user._id;
		const { rec_id, quantity } = req.body;

		Recommendation
			.findById(rec_id)
			.then(rec => {
				const bag = new Bag({
					item: rec.item,
					client: client_id,
					recommendedBy: rec.consultant,
					quantity: quantity,
					recommendation: rec_id
				});
				
				bag.save()
					.then(bag => res.send(bag))
					.catch(next);
			})
			.catch(next);
	},
	updateItemInBag(req, res, next) {
		const client_id = req.user._id;
		const { rec_id, quantity } = req.body;

		Bag.findOneAndUpdate(
				{ recommendation: rec_id }, 
				{ quantity: quantity }
			)
			.then(bagItem => {
				Bag.findById(bagItem._id)
					.then(updatedBagItem => res.send(updatedBagItem))
					.catch(next);
			})
			.catch(next);
	},
	removeItemInBag(req, res, next) {
		const client_id = req.user._id;
		const { rec_id } = req.body;

		Bag.findOneAndRemove({ recommendation: rec_id })
			.then(result => res.send(result))
			.catch(next);
	},
	getConsultantReviews(req, res, next) {
		const { consultant_id } = req.params;
		
		ConsultantReview
			.find({ consultant: consultant_id })
			.then(reviews => res.send(reviews))
			.catch(next);
	},
	postConsultantReview(req, res, next) {
		const client_id = req.user._id;
		const { consultant_id } = req.params;
		const { rating, comment } = req.body;

		review = new ConsultantReview({
			client: client_id,
			consultant: consultant_id,
			rating: rating,
			comment: comment
		});

		review.save()
			.then(rev => res.send(rev))
			.catch(next);
	},
	removeConsultantReview(req, res, next) {
		const client_id = req.user._id;
		const { review_id } = req.body;		

		ConsultantReview
			.findOneAndRemove({ $and: [{ client: client_id }, { _id: review_id }] })		
			.then(review => res.send(review))
			.catch(next);
	}
};
