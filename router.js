const ClientAuthController = require('./controllers/client_auth_controller');
const ClientController = require('./controllers/client_controller');

const ConsultantAuthController = require('./controllers/consultant_auth_controller');
const ConsultantController = require('./controllers/consultant_controller');

const passportService = require('./services/passport');
const passport = require('passport');


const clientRequireAuth = passport.authenticate('client-jwt', { session: false });
const clientRequireSignin = passport.authenticate('client-local', { session: false });
const consultantRequireAuth = passport.authenticate('consultant-jwt', { session: false });
const consultantRequireSignin = passport.authenticate('consultant-local', { session: false });


module.exports = function(app) {
	app.get('/', function(req, res) {
		res.send({ hi: 'there' });   
	});
	app.post('/signin', clientRequireSignin, ClientAuthController.signin); 
	app.post('/signup', ClientAuthController.signup);
	
	app.put('/lookingfor/', clientRequireAuth, ClientController.updateLookingFor);

	app.put('/recommendation', clientRequireAuth, ClientController.rateRecommendation);
	
	app.get('/recommendations', clientRequireAuth, ClientController.getRecommendations);
	app.get('/recommendations/:consultant_id', clientRequireAuth, ClientController.getRecommendationsByConsultantId);

	app.get('/reviews/:consultant_id', ClientController.getConsultantReviews);
	app.post('/reviews/:consultant_id', clientRequireAuth, ClientController.postConsultantReview);
	app.delete('/reviews/:consultant_id', clientRequireAuth, ClientController.removeConsultantReview);

	app.get('/bag', clientRequireAuth, ClientController.getItemsInBag);
	app.post('/bag', clientRequireAuth, ClientController.addItemToBag);
	app.put('/bag', clientRequireAuth, ClientController.updateItemInBag);
	app.delete('/bag', clientRequireAuth, ClientController.removeItemInBag);
	
	app.post('/consultant/signin', consultantRequireSignin, ConsultantAuthController.signin); 
	app.post('/consultant/signup', ConsultantAuthController.signup);

	app.get('/consultant/profile/:consultant_id', ConsultantController.getConsultantProfile);
	app.put('/consultant/profile', consultantRequireAuth, ConsultantController.updateProfileDescription);

	app.get('/consultant/recommendation/:rec_id', consultantRequireAuth, ConsultantController.getRecommendation);
	app.post('/consultant/recommendation', consultantRequireAuth, ConsultantController.saveRecommendation);
	
	app.put('/consultant/recommendation/push', consultantRequireAuth, ConsultantController.pushRecommendation);
	app.put('/consultant/recommendation/pushall', consultantRequireAuth, ConsultantController.pushAllRecommendations);
};