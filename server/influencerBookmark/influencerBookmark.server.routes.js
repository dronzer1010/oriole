var InfluencerBookmark  = require('../influencerBookmark/influencerBookmark.server.controller');

module.exports = function(app){
	app.post('/influencerBookmark', InfluencerBookmark.create);
	app.get('/influencerBookmark/:id', InfluencerBookmark.getAll);
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/home');
}