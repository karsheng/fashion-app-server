const mongoose = require('mongoose');
const Recommendation = require('../models/recommendation');
const Consultant = require('../models/consultant');

module.exports = {
	saveRecommendation(req, res, next) {
		const consultant_id = req.user._id;
		const { client_id, item_id, notes } = req.body;

		const recommendation = new Recommendation({
			item: item_id,
			consultant: consultant_id,
			client: client_id,
			notes: notes
		});

		recommendation.save()
			.then(() => res.send(recommendation._id))
			.catch(next);
	},
	pushAllRecommendations(req, res, next) {
		const consultant_id = req.user._id;
		const { client_id } = req.body;

		const timeSent = new Date().getTime();
		Recommendation.update(
			{ $and: [{ client: client_id }, { consultant: consultant_id }] },
			{ sent: true, timeSent: timeSent },
			{ multi: true }
		)
		.then((results) => res.send(results))
		.catch(next);	
	},
	pushRecommendation(req, res, next) {
		const { rec_id } = req.body;

		const timeSent = new Date().getTime();
		Recommendation.findByIdAndUpdate(rec_id, { sent: true, timeSent: timeSent })
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