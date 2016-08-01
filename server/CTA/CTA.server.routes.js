var CTA = require('./CTA.server.controller');

module.exports = function(app){
	app.post('/cta' , CTA.create);
	app.get('/getAllCTAs/:advertiserId' , CTA.getAll);
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/#!/home');
}