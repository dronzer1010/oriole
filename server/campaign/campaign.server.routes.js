var Campaign  = require('./campaign.server.controller');

module.exports = function(app){
	app.post('/campaign', Campaign.create);
	app.get('/campaign', Campaign.getAll);
	app.get('/campaign/:id', Campaign.get);
	app.get('/getAllCampaign/:advertiserId', Campaign.getAllByAdvertiserId);
	app.get('/getAllApprovedCampaign/:advertiserId', Campaign.getAllApprovedCampaign);
	app.get('/showCampaign/:id', Campaign.showCampaignToInfluencer);
	app.get('/campaignsPending', Campaign.pendingStatus );
	app.post('/changeCampaignStatus', Campaign.updateStatus);
	app.post('/campaignClose/:id', Campaign.close);
	app.post('/updateCampaignVisiblity/:id', Campaign.updateVisiblity);
	app.post('/campaignUpdate/:id', Campaign.campaignUpdate);
	app.get('/deleteCampaign/:id', Campaign.remove);
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/#!/home');
}