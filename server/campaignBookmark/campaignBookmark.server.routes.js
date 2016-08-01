var CampaignBookmark  = require('./campaignBookmark.server.controller');

module.exports = function(app){
	app.post('/campaignBookmark', CampaignBookmark.create);
	app.get('/campaignBookmark/:id', CampaignBookmark.getAll);
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/#!/home');
}