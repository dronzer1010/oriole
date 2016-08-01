var LocalStrategy = require('passport-local').Strategy;
var User = require('../user/user.server.model').User;

module.exports = function(passport, config){
	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
	  done(null, obj);
	});
	
	passport.use(new LocalStrategy({
	    usernameField: 'email',
	    passReqToCallback: true
	},
	function(req, email, password, done) {
	    var options = {
	      criteria: {$and: [{email: email}, {$or: [{user: req.body.type}, {user: 'Reseller'}]}]},
	      select: 'name email hashed_password salt'
	    };
	    User.load(options, function (err, user) {
	      if (err) return done(err);
	      if (!user) {
	        return done(null, 'Unknown user' );
	      }
	      if (!user.authenticate(password)) {
	        return done(null, 'Invalid password');
	      }
	      return done(null, user);
	    });
	}

	));
};