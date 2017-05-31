const mongoose = require('mongoose');
const Recommendation = require('../models/recommendation');
const Consultant = require('../models/consultant');

module.exports = {
	getRecommendation(req, res, next) {
		const consultant_id = req.user._id;
		const { rec_id } = req.params;

		Recommendation
			.findOne({ $and: [{ consultant: consultant_id }, { _id: rec_id }] })
			.populate({ path: 'client', select: 'name username', model: 'user' })
			.populate({ path: 'item', model: 'item' })
			.then(rec => res.send(rec))
			.catch(next);
	},
	getAllRecommendations(req, res, next) {
		const consultant_id = req.user._id;
		const { client_id } = req.params;

		Recommendation.find(
			{ $and: 
				[
					{ consultant: consultant_id }, 
					{ client: client_id }, 
					{ sent: false } 
				]
			}
		)
		.then(recs => res.send(recs))
		.catch(next);
	},
	createRecommendation(req, res, next) {
		const consultant_id = req.user._id;
		const { client_id } = req.params;
		const { item_id, notes } = req.body;

		const recommendation = new Recommendation({
			item: item_id,
			consultant: consultant_id,
			client: client_id,
			notes: notes
		});

		recommendation.save()
			.then((rec) => res.send(rec))
			.catch(next);
	},
	updateRecommendation(req, res, next) {
		const consultant_id = req.user._id;
		const { rec_id } = req.params;
		const { notes } = req.body;

		Recommendation
			.findOneAndUpdate(
				{ $and: 
					[
						{ _id: rec_id }, 
						{ consultant: consultant_id }
					] 
				},
				{ notes: notes },
				{ new: true }
			)
			.then(rec => res.send(rec))
			.catch(next);
	},
	removeRecommendation(req, res, next) {
		const consultant_id = req.user._id;
		const { rec_id } = req.params;

		Recommendation.findOneAndRemove(
			{ $and: 
				[
					{ _id: rec_id },
					{ consultant: consultant_id },
					{ sent: false }
				] 
			}
		)
		.then(rec => res.send(rec))
		.catch(next);
	},
	pushAllRecommendations(req, res, next) {
		const consultant_id = req.user._id;
		const { client_id } = req.params;

		const timeSent = new Date().getTime();
		Recommendation.update(
			{ $and: [{ client: client_id }, { consultant: consultant_id }] },
			{ sent: true, timeSent: timeSent },
			{ multi: true, new: true }
		)
		.then((results) => res.send(results))
		.catch(next);	
	},
	pushRecommendation(req, res, next) {
		const consultant_id = req.user._id
		const { rec_id } = req.params;

		const timeSent = new Date().getTime();

		Recommendation
			.findOneAndUpdate(
				{ _id: rec_id, consultant: consultant_id}, 
				{ sent: true, timeSent: timeSent },
				{ new: true }
			)
			.then(result => res.send(result))
			.catch(next);
	},
	getConsultantProfile(req, res, next) {
		const { consultant_id } = req.params;

		Consultant.findOne({ profile: consultant_id })
			.populate({ path: 'profile', select: 'name username', model: 'user'})
			.then(consultant => res.send(consultant))
			.catch(next);
	},
	updateProfileDescription(req, res, next) {
		const consultant_id = req.user._id;
		const { description } = req.body;

		Consultant.findOneAndUpdate(
			{ profile: consultant_id },
			{ description: description },
			{ new: true }
		)
		.then(result => res.send(result))
		.catch(next);
	}
};