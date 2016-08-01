/* jshint node: true */
'use strict';
var User = require('./user.server.model').User;
var Boom = require('boom');
var config = require("../config/config");
var request = require('request');
var emailService = require("../config/emailService");
var InstagramToken = require('../instagramToken/instagramToken.server.model').InstagramToken;
var Advertiser = require('../advertiser/advertiser.server.model').Advertiser;

/** create function to create User. */
exports.create = function (req, res, next) {
    var userData = {};
    var advertiserData = {};
    userData.name = req.body.name;
    userData.email = req.body.email;
    userData.password = req.body.password;
    userData.user = req.body.user;
    advertiserData.name = req.body.name;
    advertiserData.email = req.body.email;
    advertiserData.company = req.body.company;
    advertiserData.department = req.body.department;
    advertiserData.phonenumber = req.body.phonenumber;
    advertiserData.status = req.body.status;
    advertiserData.user = req.body.user;
    User.create(userData, function(err, result) {
        if (!err) {
            userData.company = advertiserData.company;
            userData.department = advertiserData.department;
            userData.phonenumber = advertiserData.phonenumber;
            if(req.body.resellerId == undefined){
                //fetch the admin user
                User.get({user: 'Admin'}, function(err, result) {
                    advertiserData.resellerId = result._id;
                    Advertiser.create(advertiserData, function(err, resultAdv){
                          emailService.signUpEmailToAdmin(userData, result.email, function (err,result){
                            return res.json(result);
                          });
                    });
                });
            }else{
                 //fetch the admin user
                User.get({user: 'Reseller',_id:req.body.resellerId}, function(err, result) {
                    advertiserData.resellerId = result._id;
                    Advertiser.create(advertiserData, function(err, resultAdv){
                          emailService.signUpEmailToAdmin(userData, result.email, function (err,result){
                            return res.json(result);
                          });
                    });
                });
            }
           
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.getAdvertsier = function (req, res, next) {
    User.get({email: req.params.email, user: 'Advertiser'}, function(err, result) {
        if (!err) {
            if(result === null) return res.json({exist:false});
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.adminCreate = function (req, res) {
    User.find({user: 'Admin'}, function(err, result) {
        if (!err) {
            if(result == null){
                var adminData = config.adminDetails;
                User.create(adminData, function(err, data) {
                    if (!err) {
                        console.log("admin created successfully");
                    } else {
                        return res.send(Boom.badImplementation(err)); // 500 error
                    }
                });
            }
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.authCallback = function (req, res) {
    if(req.user == "not suitable for login"){
        req.session.invalidLogin = {
            message: "Not suitable for login"
        };
        res.redirect('/');
    }
    else{
        req.session.influencer = {
            id: req.user.instagram.data.id,
            accessToken: req.user.accessToken
        };
        res.redirect('/influencer');
    }
};

/** getUser function to get User by id. */
exports.get = function (req, res, next) {
    User.get({email: req.params.email}, function(err, result) {
        if (!err) {
            if(result === null) return res.json({exist:false});
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all Users. */
exports.getAll = function (req, res, next) {
    User.getAll({}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** updateUser function to update User by id. */
exports.remove = function (req, res, next) {
    User.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.checkStatus = function (req, res) {
   InstagramToken.get(req.params.id, function(err, data) {
      if(!data){
        res.json({'exist': false});
      }
   });
};

exports.saveInInstagramToken = function (req, res) {
   InstagramToken.create(req.body, function(err, data) {
      if(!err){
      }
      else{
        return res.send(Boom.badImplementation(err));
      }
   });
};

exports.logoutadmin = function (req, res) {
    req.session.admin= null;
    res.json({"logout":"true"});
};

exports.logout = function (req, res) {
    req.session.advertiser = null;
    req.session.influencer = null;
    req.session.passport = null;
    req.session.admin= null;
    req.session.destroy();
    req.logout();
    // if(req.session.hire) req.session.hire = null;
    res.redirect('/');
};

exports.expireHireSession = function (req, res) {
    if(req.session.hire) req.session.hire = null;
    if(req.session.endContarct) req.session.endContarct = null;
    return res.json(req.session);
};

exports.login = function (req, res) {
    if(req.user == "Unknown user"){
        return res.json({status:"Not Exist"});
    }
    else if(req.user == "Invalid password"){
        return res.json({status:"Invalid Username and Password"});
    }
    else{
        User.get({$and: [{email: req.body.email}, {$or: [{user: req.body.type}, {user: 'Reseller'}]}]}, function(err, result) {
            if (!err) {
                if(result.user=='Reseller'){
                    req.session.reseller = {
                        id: result._id,
                        email: result.email,
                        user:'reseller',
                        resellerApiKey:result.resellerApiKey
                    };
                }else{
                    req.session.admin = {
                        id: result._id,
                        email: result.email,
                        user:'admin'
                    };
                }
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err));
            }
        });
    }
};

exports.updatePassword = function(req, res){

    var options = {
      criteria: { email: req.body.email },
      select: 'name email hashed_password salt'
    };
     User.load(options, function (err, user) {

          if (err){
            
            return done(err);
          }
          if (!user) {
            return res.json({status:"Not Exist"});
          }
          if (!user.authenticate(req.body.password)) {
            return res.json({status:"Invalid Username and Password"});
          }
        User.updateById({email: req.body.email}, req.body, function(err, result) {
            if (!err) {

                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    });
};


exports.updateUser = function(req, res){
    User.updateBy({email: req.params.userId}, req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
