var localFile  = require('./localFile.server.controller');

module.exports = function(app){
	app.post('/localFileUpload', localFile.create);
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/');
}