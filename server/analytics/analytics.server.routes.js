var Analytics  = require('./analytics.server.controller');

module.exports = function(app){
	app.post('/auth/instagram', Analytics.connectAdvertiserInstagramAccount);
	app.post('/advertiserAnalytics', Analytics.advertiserAnalytics);
	app.post('/influencerAnalytics', Analytics.influencerAnalytics);
};
