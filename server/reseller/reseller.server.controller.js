/* jshint node: true */
'use strict';
var User = require('../user/user.server.model').User,
    Advertiser = require('../advertiser/advertiser.server.model').Advertiser,
    Boom = require('boom'),
    config = require("../config/config"),
    emailService = require("../config/emailService");

/** create function to create reseller. */
function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

//register new advertiser
exports.newAdvertiser =function(req,res){
    //server side validation
    var errors = [];
    if(req.body.name == undefined || req.body.name==null || req.body.name ==""){
        errors.push({name:'name is missing'})
    }
    if(req.body.email == undefined || req.body.email==null || req.body.email ==""){
        errors.push({email:'email is missing'})
    }
    if(req.body.company == undefined || req.body.company==null || req.body.company==""){
        errors.push({company:'company is missing'})
    }
    if(req.body.phonenumber == undefined || req.body.phonenumber==null || req.body.phonenumber==""){
        errors.push({phonenumber:'phonenumber is missing'})
    }
    if(req.body.department == undefined || req.body.department==null || req.body.department==""){
        errors.push({department:'department is missing'})
    }
    if(req.body.apiKey == undefined || req.body.apiKey==null || req.body.apiKey==""){
        errors.push({apiKey:'apiKey is missing'})
    }
    if(errors.length>0){
       return res.json(errors);
    }
    var advertiserData = {};
    advertiserData.name = req.body.name;
    advertiserData.email = req.body.email;
    advertiserData.company = req.body.company;
    advertiserData.department = req.body.department;
    advertiserData.phonenumber = req.body.phonenumber;
    advertiserData.status = 'Pending';
    //advertiserData.user = 'Advertiser';
    var userData = {};
    userData.name = req.body.name;
    userData.email = req.body.email;
    userData.password = req.body.password;
    userData.user = 'Advertiser';
    User.get({user: 'Reseller',resellerApiKey:req.body.apiKey}, function(err, result) {
        if(!err){
            if(result!=undefined || result!=null){
                //check if advertiser already register
                Advertiser.get({email:advertiserData.email}, function(err, adv){
                    if(adv == null){
                        advertiserData.resellerId = result._id;
                        User.create(userData, function(err, userdoc) {
                            console.log(err)
                            if(!err){
                                userData.company = advertiserData.company;
                                userData.department = advertiserData.department;
                                userData.phonenumber = advertiserData.phonenumber;
                                Advertiser.create(advertiserData, function(err, resultAdv){
                                      emailService.signUpEmailToAdmin(userData, result.email, function (err,result){
                                        delete advertiserData.resellerId;
                                        return res.json({ok:true,data:advertiserData});
                                      });
                                });
                            }
                        });
                        
                    }else{
                        errors.push({userExists:'A user already registered with this email.Please use different email'});
                        res.json(errors);
                    }
                });
                
            }else{
                errors.push({apiKey:'apiKey key is invalid'});
                res.json(errors);
            }
        }
        
    });
};

exports.create = function (req, res) {
     User.getAll({email: req.body.email}, function(err, result) {
        if(req.session.admin !==undefined && req.session.admin.id){
            if (!err) {
                if(result.length<1){
                    require('crypto').randomBytes(48, function(err, buffer) {
                        var token = buffer.toString('hex');
                        req.body.resellerApiKey = token;
                        User.create(req.body, function(err,result){
                            res.json(result);
                        });
                    });
                    
                }else{
                    res.json({error:"Reseller already exists"});
                }
            } 
        }
    });
    
};

/** getAll function to get all resellers. */
exports.getAll = function (req, res, next) {
    if(req.session.admin !==undefined && req.session.admin.id){
        User.getAll({user: 'Reseller'}, function(err, result) {
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
};

exports.remove = function(req,res){
    if(req.session.admin !==undefined && req.session.admin.id){
        //Transfer the reseller data to site admin before deleting
        User.get({user: 'Admin'}, function(err, result) {
            Advertiser.updateBy({resellerId: req.params.id}, {resellerId: result._id}, function(err, result) {
                 User.removeById({_id:req.params.id,user:'Reseller'}, function(err, result) {
                    if (!err) {
                        return res.json(result);
                    } else {
                        return res.send(Boom.badImplementation(err)); // 500 error
                    }
                });
            })
        });
    }
};



