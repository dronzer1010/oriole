var Conversation  = require('./conversation.server.controller');
var paypal = require('../paypal/paypal.server.controller');

module.exports = function(app){
	app.post('/conversation', Conversation.create);
	app.post('/conversation/:id', Conversation.update);
	app.get('/conversation/:id', Conversation.getAll);
	app.get('/userConversations/:userId', Conversation.getAllConvesationsRelatedToUser);
	app.get('/singleConversation', Conversation.getSingle);
	
	/*	app.post('/campaignClose/:id', AppliedCampaign.closeCampaign);
	*/
	app.get('/appliedCampaignOfAdvertiser/:id', Conversation.appliedCampaignOfAdvertiser);
	app.get('/myCampaign/:id', Conversation.myCampaign);
	app.get('/hiredList/:id', Conversation.hiredList);
	app.get('/applicantList/:id', Conversation.applicantList);
	app.get('/payment', paypal.paypalPayment);
	app.post('/orderExecuteIpn', paypal.orderExecuteIpn);
	
	
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/home');
}