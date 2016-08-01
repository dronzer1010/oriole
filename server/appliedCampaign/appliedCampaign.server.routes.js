/*var AppliedCampaign  = require('./appliedCampaign.server.controller');
var paypal = require('../paypal/paypal.server.controller');*/
/*
module.exports = function(app){
	app.post('/appliedCampaign', AppliedCampaign.create);
	app.post('/appliedCampaign/:id', AppliedCampaign.update);
	app.get('/appliedCampaign/:id', AppliedCampaign.getAll);
	app.get('/singleCampaign/:id', AppliedCampaign.getSingle);
	app.get('/myCampaign/:id', AppliedCampaign.myCampaign);
	app.get('/appliedCampaignOfAdvertiser/:id', AppliedCampaign.appliedCampaignOfAdvertiser);
	app.get('/applicantList/:id', AppliedCampaign.applicantList);
	app.get('/hiredList/:id', AppliedCampaign.hiredList);
	app.post('/campaignClose/:id', AppliedCampaign.closeCampaign);
	app.get('/payment', paypal.paypalPayment);
	app.get('/orderExecute', paypal.orderExecute);
	app.post('/orderExecuteIpn', paypal.orderExecuteIpn);
	

};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/#!/home');
}*/