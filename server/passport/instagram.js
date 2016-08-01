var InstagramStrategy = require('passport-instagram').Strategy;
var User = require('../user/user.server.model').User;
var Influencer = require('../influencer/influencer.server.model').Influencer;
var instagramMediaCtrl = require('../instagramMedia/instagramMedia.server.controller');

module.exports = function(passport, config){
	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
	  done(null, obj);
	});

	passport.use(new InstagramStrategy({
	  clientID: config.instagramConfig.clientID,
	  clientSecret: config.instagramConfig.clientSecret,
	  callbackURL: config.url.basePath + "/auth/instagram/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		console.log(refreshToken);
	    var data = JSON.parse(profile._raw).data;
	    //console.log(data);
	    if (JSON.parse(profile._raw).data.counts.followed_by < config.instagramConfig.followers && config.instagramConfig.testUserName!=profile.username){
	      return done(null, "not suitable for login");
	    }
	    else{
	    	var options = {
			      criteria: { 'instagram.data.id': profile.id }
			};
		    User.load(options, function (err, user) {
		      if (err) return done(err);
		      if (!user) {
		        user = new User({
		          name: profile.displayName,
		          username: profile.username,
		          accessToken: accessToken,
		          provider: 'instagram',
		          user: "Influencer",
		          instagram: profile._json
		        });
		        user.save(function (err){
		          if (err) console.log(err);
		          instagramMediaCtrl.saveMediaOfIntialzation(
		          	profile.id, accessToken,
		          	function(err, returnVal){
		          		return done(err, user);
		        	});
		      	});
		      } else {
		      	//console.log(accessToken);
		      	//update the access token for the influencer
		      	Influencer.get({instagramId: profile.id}, function(err, result) {
			        if (!err) {
			            if(result !== null){
			            	result.accesstoken = accessToken;
			            	result.profile_picture = data.profile_picture;
			            	result.isTokenValid = "yes";
			            	result.save(function(err, reuslt){
			            		//console.log(err,result);
			            	});
			            }
			        } else {
			            return res.send(Boom.badImplementation(err)); // 500 error
			        }
			    });
		    	user.accessToken = accessToken;
		    	user.instagram =  profile._json;
    			user.save(function (err) {
					if (err) console.log(err);
					return done(err, user);
				});
		      }
		    });

	    }
	}
  ));
};
