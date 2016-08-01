var staticdir = process.env.NODE_ENV === 'develop' ? 'dist.dev' : 'dist.prod';

var express = require('express'),
    Routes = require('./server/routes'),
    Db = require('./server/config/db'),
    config = require('./server/config/config'),
    bodyParser = require('body-parser'),
    path = require('path'),
    passport = require('passport'),
    expressSession = require('express-session'),
    cookieParser = require('cookie-parser'),
    messageServer = require('./server/message/messaging.server.js'),
    //load = require('./server/awsUpload/fileUpload');
    app = express();

app.use(cookieParser());
app.use(expressSession({secret:'somesecrettokenhere'}));
app.use(express.static(__dirname + '/' + staticdir));
app.use(bodyParser.urlencoded({ limit: '10000000', extended: true }));
app.use(bodyParser.json({limit: '10000000',defer: true}));
require('./server/passport/instagram')(passport, config);
require('./server/passport/local')(passport, config);

app.use(passport.initialize());
app.use(passport.session());
process.maxTickDepth = 1000000;

app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
});
/*app.get('/:type(influencer|advertiser)/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: './'+staticdir });
});*/


/** load routes*/
app.get('/', function(req, res) {
    res.render('./'+staticdir+'/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/influencer/campaigns', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/influencer/bookmarks', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/influencer/my-campaigns', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/influencer/messages', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/advertiser/home', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});
app.all('/advertiser/help', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});
app.all('/advertiser/signup', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});
app.all('/advertiser/login', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});
app.all('/advertiser/campaigns', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/advertiser/messages', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/influencer/analytics', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/advertiser/analytics', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/influencer/details', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/influencer/myprofile', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.all('/advertiser/cta', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});
app.all('/advertiser/create', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/credential', function(req, res) {
  res.json(req.session);
});

// app.get('/credentialHire', function(req, res) {
//   res.json(req.session);
// });
require('./server/routes')(app, passport);

app.all('/*', function(req, res) {
    res.sendFile('index.html', { root: './'+staticdir }); // load the single view file (angular will handle the page changes on the front-end)
});

var port = config.server.port;

// app.listen(port);
var socketioisten;
if(process.env.NODE_ENV === 'production'){
    var https = require('https');
    var fs = require('fs');

    var options = {
      key: fs.readFileSync('/root/web/expaus1.key'),
      cert: fs.readFileSync('/root/web/expaus.crt')
    };

   socketioisten = https.createServer(options, app).listen(port);

}else{
     socketioisten = app.listen(port);
}
console.log('App started on port ' + port);

messageServer.listen(socketioisten);
 var AanalyticsCtrl = require('./server/analytics/analytics.server.controller');
 //AanalyticsCtrl.trackFollowersCountDaily();
 //AanalyticsCtrl.checkExistenceOfMediaImages();
//cron job to update advertiser analytics
//AanalyticsCtrl.updateProfilePicture();
if(process.env.NODE_ENV === 'production'){
    var CronJob = require('cron').CronJob;
    var AanalyticsCtrl = require('./server/analytics/analytics.server.controller');
    new CronJob('00 00 00 * * *', function() {
      AanalyticsCtrl.updateAnalyticsOfAllUsers();
    }, null, true, 'Asia/Tokyo');

    new CronJob('00 00 16 * * *', function() {
      AanalyticsCtrl.checkAccessTokenValidity();
    }, null, true, 'Asia/Tokyo');
    new CronJob('00 00 02 * * *', function() {
      AanalyticsCtrl.updateProfilePicture();
    }, null, true, 'Asia/Tokyo');

    new CronJob('00 00 02 * * *', function() {
      AanalyticsCtrl.checkExistenceOfMediaImages();
    }, null, true, 'Asia/Tokyo');
     new CronJob('00 00 00 * * *', function() {
      AanalyticsCtrl.trackFollowersCountDaily();
    }, null, true, 'Asia/Tokyo');
    new CronJob('00 00 */3 * * *', function() {
      AanalyticsCtrl.processAnalyticsForMissingUser();
    }, null, true, 'Asia/Tokyo');
}