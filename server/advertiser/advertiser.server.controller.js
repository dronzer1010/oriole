/* jshint node: true */
'use strict';

// var advertiser = require('../model/advertiser.js'),
var Advertiser = require('./advertiser.server.model').Advertiser,
    Campaign = require('../campaign/campaign.server.model').Campaign,
    Help = require('../help/advertiser.help.model').Help,
    Follower = require('../follower/follower.server.model').Follower,
    Boom = require('boom'),
    config = require("../config/config"),
    cryptoMethod = require('../config/cryptoMethod'),
    User = require('../user/user.server.model').User,
    async = require('async'),
    cloudinary = require('cloudinary'),
    path = require('path'),
    fs = require('fs'),
    multer  = require('multer'),
    cloudinary = require('cloudinary'),
    config = require('../config/config'),
    AanalyticsCtrl = require('../analytics/analytics.server.controller'),
    emailService = require("../config/emailService");



var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        var staticdir = process.env.NODE_ENV === 'develop' ? 'dist.dev' : 'dist.prod';
        cb(null, './'+staticdir+'/assets/images/upload')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
exports.imgupload = function(req, res, next){
    var upload = multer({ //multer settings
                storage: storage
    }).single('file');
    upload(req,res,function(err,result){
       
        //console.log(err,result,req.file)
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }else{
            cloudinary.config(config.cloudinary);
            cloudinary.uploader.upload(req.file.path, function(result) { res.json({error_code:0,result:result}) });
            
        }
    })
};
/** create function to create advertiser. */
exports.create = function (data, callback) {
    Advertiser.create(data, callback);
};

/** create function to create advertiser. */
exports.newHub = function (req, res) {
    console.log(req.body);
    Help.create(req.body, function(err,result){
        console.log(err,result)
    });
};
exports.fetchHubList = function (req, res) {
    Help.getAll({advertiserId:req.params.id}, function(err,result){
        if(!err){
            res.json(result);
        }
    });
};
//fetch the data fro follower analytics
exports.fetchFollowerDailyCount =function(req,res){
     Follower.get({instagramId: req.params.id}, function(err, result) {
           if(!err){
                res.json(result);
           }else{
                res.json({});
           }
     });
};
/** getadvertiser function to get advertiser by id. */
exports.get = function (req, res, next) {
    Advertiser.get({email: req.params.id}, function(err, result) {


        if (!err) {
            if(result === null) return res.json({exist:false});

            if(result.userLevel/* =="Trial"*/){
                //code to fetch the advertiser campaign count
                Campaign.getAdvertiserCampaignCount({advertiserId:result._id},function(err,count){
                    //console.log(count);
                    if(count){
                        //console.log(result)
                        var obj ={};
                        obj.campaignCount= count;
                        obj.result=result;
                        return res.json(obj);
                    }else{
                        var obj ={};
                        obj.result=result
                        return res.json(obj);
                    }
                    
                });
            }else{
                 var obj ={};
                 obj.result=result
                 return res.json(obj);
            }

            
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};



exports.getAdvertiser = function (req, res, next) {
    Advertiser.get({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};


/** getadvertiser function to get advertiser by id. */
exports.getStatus = function (req, res) {
    if(req.user == "Unknown user"){
        return res.json({status:"Not Exist"});
    }
    else if(req.user == "Invalid password"){
        return res.json({status:"Invalid Username and Password"});
    }
    else{
        Advertiser.get({email: req.body.email}, function(err, result) {
            //console.log(result);
            if(result == null){
                return res.json({status:"1Invalid Username and Password"});
            }
            if (!err) {
                if(result.status == "Pending") return res.json({status:"Pending"});
                else if(result.status == "Declined") return res.json({status:"Declined"});
                else if( result.status == "Accept" && result.verified === false) return res.json({status:"Verify your email"});
                else {

                     req.session.advertiser = {
                        id: result._id,
                        email: result.email
                    };
                    if(result.instagramId){
                        req.session.advertiser.instagramId = result.instagramId;
                    }
                    return res.json(result);
                }
            } else {
                return res.send(Boom.badImplementation(err));
            }
        });
    }
};

exports.remove = function(req,res){
    Advertiser.removeById({id:req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all advertisers. */
exports.getAll = function (req, res, next) {
    var query;
    var resellerId;
    if(req.session.reseller!==undefined){
        resellerId = req.session.reseller.id;
    }else if(req.session.admin!==undefined){
        resellerId = req.session.admin.id;
    }
    if(req.query.status){
        query = {status:"Accept",resellerId:resellerId}
    }else{
        query = {resellerId:resellerId}
    }
    Advertiser.getAll(query, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.removeAdvertiserStat = function (req, res, next) {
    //console.log(req.params.id);
    Advertiser.removestat({_id: req.params.id}, { instagramId: "", isTokenValid: "", accessToken: "", bestTimeToPost: "", followerDemographics: ""  }, function(err1, result1) {
        if (err1) {
          return res.send(Boom.badImplementation(err1));
        }
        else{
           return res.json(result1);
        }
    });
};

/** getAll function to get all advertisers. */
exports.pendingStatus = function (req, res, next) {

    //check for the reseller id
    var resellerId;
    if(req.session.reseller!==undefined){
        resellerId = req.session.reseller.id;
    }else if(req.session.admin!==undefined){
        resellerId = req.session.admin.id;
    }
    Advertiser.getPending({status: 'Pending',resellerId:resellerId}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all advertisers. */
exports.updateStatus = function (req, res, next) {
    var email = req.body.email;
    if(req.body.status == "Declined"){
        async.parallel([
            function(callback){
                    Advertiser.removeById({_id: req.body._id}, function(err1) {
                        if (err1) {
                           callback(err1);
                        }
                    });
            }, 
            function(callback){
                    User.removeById({email: email}, function(err2) {
                        if (err2) {
                           callback(err2);
                        }
                    });
            }],
        function(err3, results){
            if (err3) {
                return res.send(Boom.badImplementation(err3)); // 500 error
            } 
        });
         emailService.decline(email, function(error, data){
            if(error){
                return res.send(Boom.badImplementation(error));
            }
            else{
                return res.json({message: "Declined User"});
            }
        });
    }
    else{    
        Advertiser.updateById({_id: req.body._id}, {status: req.body.status}, function(err, result) {
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
};

/** getAll function to get all advertisers. */
exports.updateAdvertiser = function (req, res, next) {
    var email = req.params.id;
        async.parallel([
            function(callback){
                    Advertiser.updateBy({email: email}, req.body, function(err1, result1) {
                        if (err1) {
                           callback(err1);
                        }
                        else{
                            callback(null, result1);
                        }
                    });
            }, 
            function(callback){
                    delete req.body._id;
                    User.updateBy({email: email}, req.body, function(err2, result2) {
                        if (err2) {
                           callback(err2);
                        }
                        else{
                            callback(null, result2);
                        }
                    });
        }],
        function(err3, results){
            if (err3) {
                return res.send(Boom.badImplementation(err3)); // 500 error
            } 
            else{
                Advertiser.get({email: req.body.email}, function(error, result){    
                    if (error) {  return res.send(Boom.badImplementation(err3)); }
                    req.session.advertiser = {
                        id: result._id,
                        email: result.email
                    };
                });
                return res.json({'email': req.body.email});
            }
        });
};
exports.updateAdvertiserOnly = function (req, res, next) {
    var email = req.params.id;
    Advertiser.updateBy({email: email}, req.body, function(err1, result1) {
        if (err1) {
          return res.send(Boom.badImplementation(err1));
        }
        else{
           return res.json(result1);
        }
    });
};

/** updateadvertiser function to update advertiser by id. */
exports.update = function (req, res, next) {
    Advertiser.updateById({_id: req.params.id}, req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
exports.updateReseller = function (req, res, next) {
    if(req.session.admin !==undefined && req.session.admin.id){
        var _id = req.body._id;
        delete  req.body._id;
        Advertiser.updateBy({_id: _id}, req.body, function(err, result) {
            console.log(err)
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
};
exports.updateHashTags = function (req, res, next) {
    /*db.getCollection('advertisers').find({"hashtags.created_at": {$gte: ( new Date(Date.now() - 2*60*60*1000))},"instagramId":"2379122044"},
    {hashtags: {$elemMatch: {"created_at": {$gte: ( new Date(Date.now() - 2*60*60*1000))}}}}
)*/
    Advertiser.get({email: req.params.email}, function(err, result) {
           
            var addTag =false;
            if(result != undefined && result !== null){
                if(result.hashtags !== undefined){
                    var d = new Date();
                    var d2 = new Date();
                    var noOfTagAddedInLastHour=0
                    d2.setHours(d.getHours() - 1);
                    for(var i=0; i<result.hashtags.length;i++){
                        if(result.hashtags[i].created_at>d2){
                            noOfTagAddedInLastHour++;
                        }
                    }
                    if(noOfTagAddedInLastHour<5){
                        addTag =true;
                    }

                }else{
                    addTag =true;
                }
                if(addTag){
                        Advertiser.updateHashTags({email: req.params.email}, req.body, function(err, result) {
                            if (!err) {
                                 Advertiser.get({email: req.params.email}, function(err, result) {
                                    process.nextTick(function() {
                                        var lastTag = result.hashtags[result.hashtags.length-1];
                                        console.log(lastTag);
                                        AanalyticsCtrl.processTagAnalytics(lastTag.name,lastTag._id,result.accessToken, result.instagramId,'Advertiser');
                                    });
                                 });
                                return res.json(result);
                            } else {
                                return res.send(Boom.badImplementation(err)); // 500 error
                            }
                        });
                }else{
                    res.json({"max_tag_limit":"Max 5 tag allow to add  in one hour duration"})
                }
            }
    });
    
};
exports.removeHashTag = function (req, res, next) {
    Advertiser.removeHashTag({email: req.params.email}, req.body, function(err, result) {
        //console.log(err,result)
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
exports.updateSubscriptionLevel = function (req, res, next) {
    Advertiser.updateBy({_id: req.body._id}, req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
/** updateadvertiser function to update advertiser by id. */
exports.remove = function (req, res, next) {
    Advertiser.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.linkVerified = function(req,res){
   var link = cryptoMethod.decrypt(req.params.link);
   var updateData = {};
   updateData.verified = true;
   Advertiser.updateLink({email: link}, updateData, function(err, result){
         if (!err) {
            if(result == "User already verified") {
                req.session.verified = {
                    message: "already verified"
                };
                res.redirect('/home');
            }
            else {
                req.session.verified = {
                    message: "verified successfully"
                };
                res.redirect('/home');
            }
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
   });
};

exports.advertiserEmail = function(req, res){
   
    Advertiser.get({'_id': req.params.id}, function(error, result){
        var data;
        if(req.body.campaignStatus){  
         
            if(result.campaignStatus === true){
               
                if(req.body.campaignStatus=='Declined'){
                    
                    data="Hi "+result.name+",<br><br>Unfortunately, Your campaign has been declined. Following is the reason for the decline.<br><br>"+req.body.declimeMessage+"<br><br>If you have any questions, please feel free to contact us.<br><br>support@expaus.in<br>Team expaus";
                }else{
                    data = "Hello,<br>Your campaign status of campaign "+req.body.campaignName+"is changed. Updated campaign status is: "+req.body.campaignStatus;
                }
                mailSend(result.email, data, res);
            }
            else{
                return res.json({message: "mail notification is not on"});
            }
        }
        else if(req.body.message){
            
            if(result.message){      
                 data = "Hello,<br>You recieved message from influencer<br>"+ req.body.message;
                mailSend(result.email, data, res);
            }
            else{
                return res.json({message: "mail notification is not on"});
            }
        }
        else{
            if(result.campaignUpdate){   
                data = "Hello,<br>influencer applied to your campaign";
                mailSend(result.email, data, res);
            }
            else{
                return res.json({message: "mail notification is not on"});
            }
        }
    });
};
var mailSend = function(email, data, res){
    emailService.messageToAdvertiser(email, data, function(error, data){
        if(error){

            return res.send(Boom.badImplementation(error));
        }
        else{
            return res.json({message: "mail sent successfully"});
        }
    });
};
exports.advertiserEmailWithoutData = function(req, res){
    Advertiser.get({'_id': req.params.id}, function(error, result){
        if(result.campaignUpdate){   
            var data = "Hello,<br>influencer applied to your campaign";
            mailSend(result.email, data, res);
        }
        else{
            return res.json({message: "mail notification is not on"});
        }
    });
};



