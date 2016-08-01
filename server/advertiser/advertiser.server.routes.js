var Advertiser = require('./advertiser.server.controller');

module.exports = function(app, passport) {
    app.post('/advertiserStatus',
        passport.authenticate('local', {
            failureRedirect: '/home',
        }), Advertiser.getStatus);
    app.get('/verify/:link', Advertiser.linkVerified);
    app.get('/advertiserPending', Advertiser.pendingStatus);
    app.get('/advertiserList', Advertiser.getAll);
    app.get('/fetchHubList/:id', Advertiser.fetchHubList);
    app.post('/changeStatus', Advertiser.updateStatus);
    app.post('/updateSubscriptionLevel', Advertiser.updateSubscriptionLevel);
    app.get('/advertiserById/:id', Advertiser.get);
    app.get('/fetchFollowerDailyCount/:id', Advertiser.fetchFollowerDailyCount);
    app.get('/advertiserRemove/:id', Advertiser.remove);
    app.get('/advertiserData/:id', Advertiser.getAdvertiser);
    app.post('/updateAdvertiser/:id', Advertiser.updateAdvertiser);
    app.post('/newHub/', Advertiser.newHub);
    app.post('/updateAdvertiser_/:id', Advertiser.update);
    app.post('/updateAdvertiserOnly/:id', Advertiser.updateAdvertiserOnly);
    app.post('/updateHashTags/:email', Advertiser.updateHashTags);
    app.post('/removeHashTag/:email', Advertiser.removeHashTag);
    app.post('/advertiserEmail/:id', Advertiser.advertiserEmail);
    app.get('/advertiserEmail/:id', Advertiser.advertiserEmailWithoutData);
    app.get('/removeAdvertiserStat/:id', Advertiser.removeAdvertiserStat);
    app.post('/imgupload',Advertiser.imgupload);  
    app.post('/updateReseller', Advertiser.updateReseller);
};
