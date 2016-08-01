var User = require('./user.server.controller');
var request = require('request');
module.exports = function(app, passport){
    app.get('/auth/instagram',
      passport.authenticate('instagram', 
        { scope: ['basic', 'public_content', 'follower_list', 
        'comments', 'relationships', 'likes'] }));
    app.get('/auth/instagram/callback', 
      passport.authenticate('instagram', 
        { failureRedirect: '/' 
      }), User.authCallback );

    app.post('/advertiser', User.create );
    app.get('/advertiser/:email', User.getAdvertsier );
    User.adminCreate();
    app.post('/adminLogin',
    passport.authenticate('local', {
      failureRedirect: '/admin',
    }), User.login);

    app.post('/logoutadmin', User.logoutadmin);
    app.get('/logout', User.logout);
    app.get('/expireHireSession', User.expireHireSession);
    app.get('/signupStatus/:id', ensureAuthenticated, User.checkStatus);
    app.post('/submitAccessToken', ensureAuthenticated, User.saveInInstagramToken);
    app.post('/updatePassword', User.updatePassword);
    app.post('/updateStatus/:id', User.updateUser);
  };

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}