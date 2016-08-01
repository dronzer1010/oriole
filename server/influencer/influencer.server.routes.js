var Influencer  = require('./influencer.server.controller');

module.exports = function(app){
	app.get('/getInstagramProfile', ensureAuthenticated, Influencer.getInstagramProfile);
	app.get('/getInstagramProfileAd/:id1/:id2', ensureAuthenticated, Influencer.getInstagramProfileAd);
	app.get('/mediaLikes', ensureAuthenticated, Influencer.mediaLikes);
	app.get('/influencer/:instagramId', ensureAuthenticated, Influencer.get);
	app.get('/checkInfluencerExistence/:instagramId', ensureAuthenticated, Influencer.checkInfluencerExistence);
	app.get('/singleInfluencer/:id', ensureAuthenticated, Influencer.getSingle);
	app.get('/influencerData/:id', ensureAuthenticated, Influencer.getById);
	app.post('/influencer/:instagramId', ensureAuthenticated, Influencer.update);
	app.post('/updateInfluencer/:instagramId', ensureAuthenticated, Influencer.update);
	app.get('/getAllInfluencer/:page', Influencer.getAll);
	//app.get('/getAppFollowersCount', Influencer.getAppFollowersCount);
	app.post('/influencer', ensureAuthenticated, Influencer.create);
	app.post('/sendMessageToInfluencer', Influencer.sendMessageToInfluencer);
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/');
}