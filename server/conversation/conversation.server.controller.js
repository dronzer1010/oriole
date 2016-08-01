/* jshint node: true */
'use strict';

var Conversation = require('./conversation.server.model').Conversation,
    Boom = require('boom'),
    Influencer = require('../influencer/influencer.server.model').Influencer,
    Message = require('../message/message.server.model').Message,
    paypal = require('../paypal/paypal.server.controller');
/** create function to create Conversation. */
exports.create = function (req, res, next) {
    
    req.session.currenturl = req.body.currenturl;
    delete req.body.currenturl;
   
    if(req.body.status == "hired"){
        if(req.body.payMethod == "bank"){
            var object = {};
            object.campaignId = req.body.campaignId;
            object.influencerId = req.body.influencerId;
            object.advertiserId = req.body.advertiserId;
            object.price = req.body.price;
            object.message = req.body.message;
            object.status = 'hired';
            object.payMethod = 'bank';
           
            var message = {
                        recipient: object.influencerId,
                        sender: object.advertiserId,
                        message: object.message,
                        type : 'normal'
            };

            Conversation.findOne({ $and: [ { 'campaignId': object.campaignId}, { 'influencerId': object.influencerId},{ 'advertiserId': object.advertiserId}] } , function(err, result){
                    console.log("<><><><>", result);
                    if(result){ 
                       console.log(">>>>>>>>>>>>>>>>update");
                        Conversation.update({'_id': result._id},object, function(err, updateResult) {
                            if (!err) {
                                message.conversation = result._id;
                                console.log(">>>>>>>>>>>>>>>>update", message);
                                Message.create(message,function(err, result){
                                    return res.json({
                                        'url': req.session.currenturl
                                    });
                                });
                                console.log('record updated');
                            }else{console.log(err);}
                       
                        });
                    }else{
                        console.log(">>>>>>>>>>>>>>>>create conversation", object);
                        Conversation.create(object, function(err, result) {
                            if (!err) {
                                message.conversation = result._id;
                                console.log(">>>>>>>>>>>>>>>>create", message);
                                Message.create(message,function(err, result){
                                    return res.json({
                                        'url': req.session.currenturl
                                    });
                                });
                                console.log('record created', result);
                            }else{console.log(err);}
                        });
                    }


                });


        }else{
            Influencer.get({_id: req.body.influencerId}, function(err, result) {
                if (!err) {
                    paypal.paypalPayment(req, res, result.paypalSetting.paypalEmail);
                }
            });
        }
        
    } else{  
        delete req.body.currenturl;
        Conversation.create(req.body, function(err, result) {
            if (!err) {
                if(result == "data already exist") return res.json({message: "data already exist"});
                else{
                    return res.json(result);
                }     
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
};

exports.update = function (req, res, next) {
    req.session.currenturl = req.body.currenturl;
    delete req.body.currenturl;
    if(req.body.status == "hired"){
        if(req.body.payMethod == "bank"){
            var object = {};
            object.campaignId = req.body.campaignId;
            object.influencerId = req.body.influencerId;
            object.advertiserId = req.body.advertiserId;
            object.price = req.body.price;
            object.message = req.body.message;
            object.status = 'hired';
            object.payMethod = 'bank';
            var message = {
                        recipient: object.influencerId,
                        sender: object.advertiserId,
                        message: object.message,
                        type : 'normal'
            };
            Conversation.findOne({ $and: [ { 'campaignId': object.campaignId}, { 'influencerId': object.influencerId},{ 'advertiserId': object.advertiserId}] } , function(err, result){
                    console.log("<><><><>", result);
                    if(result){ 
                       console.log(">>>>>>>>>>>>>>>>update");
                        Conversation.update({'_id': result._id},object, function(err, updateResult) {
                            if (!err) {
                                message.conversation = result._id;
                                console.log(">>>>>>>>>>>>>>>>update", message);
                                Message.create(message,function(err, result){
                                    return res.json({
                                        'url': req.session.currenturl
                                    });
                                });
                                console.log('record updated');
                            }else{console.log(err);}
                       
                        });
                    }else{
                        console.log(">>>>>>>>>>>>>>>>create conversation", object);
                        Conversation.create(object, function(err, result) {
                            if (!err) {
                                message.conversation = result._id;
                                console.log(">>>>>>>>>>>>>>>>create", message);
                                Message.create(message,function(err, result){
                                    return res.json({
                                        'url': req.session.currenturl
                                    });
                                });
                                console.log('record created', result);
                            }else{console.log(err);}
                        });
                    }
                });


        }else{
            Influencer.get({_id: req.body.influencerId}, function(err, result) {
                if (!err) {
                    paypal.paypalPayment(req, res, result.paypalSetting.paypalEmail);
                }
            });
        }
    }
    else if(req.body.status == "inReview" || req.body.status == "changesRequired"){
        Conversation.update({_id: req.params.id}, req.body, function(err, result) {
            if (!err) {
                 return res.json({'InReview': 'InReview'});
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
    else{ 

        Conversation.get({_id: req.params.id}, function(err, result) {
            if (!err) {
               if(result.payMethod != 'bank'){
                   paypal.processPayment(req, res,result.pay_key,function(err,response){
                       if(response.paymentExecStatus == 'COMPLETED'){
                            Conversation.update({_id: req.params.id}, req.body, function(err, result) {
                                if (!err) {
                                     return res.json({'EndContract': 'Successfull'});
                                } else {
                                    return res.send(Boom.badImplementation(err)); // 500 error
                                }
                            });
                        }

                   });
                }else{
                    Conversation.update({_id: req.params.id}, req.body, function(err, result) {
                                if (!err) {
                                     return res.json({'EndContract': 'Successfull'});
                                } else {
                                    return res.send(Boom.badImplementation(err)); // 500 error
                                }
                    });
                }


            }
        });
    }
};

/** get all conversation realated to user. */
exports.getAllConvesationsRelatedToUser = function (req, res, next) {
    Conversation.getAllByQueryAndPopulate({$or: [{influencerId: req.params.userId}, {advertiserId: req.params.userId}]}, 
        function(err, result){
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
    });
};


/** create function to create Conversation. */
exports.closeCampaign = function (req, res, next) {
    Conversation.updateById({'influencerId': req.params.id, status: 'hired'}, {status: 'close'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAppliedCampaign function to get Conversation by id. */
exports.getSingle = function (req, res, next) {
    var query = [];
    if(req.query){
        if(req.query.campaignId) query.push({campaignId:req.query.campaignId});
        if(req.query.advertiserId) query.push({advertiserId:req.query.advertiserId});
        if(req.query.influencerId) query.push({influencerId :req.query.influencerId});
        if(req.query.status) query.push({status:req.query.status});
    }
    console.log(">>>>>query", query);
    Conversation.get({$and:query}, 
        function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.appliedCampaignOfAdvertiser = function (req, res, next) {
    Conversation.getAllByQuery({advertiserId: req.params.id, status: {$in:['applied', 'invited', 'directOffer', 'hired', 'close', 'inReview', 'changesRequired', 'completed']}}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.applicantList = function (req, res, next) {
    Conversation.applicantList({advertiserId: req.params.id, status: {$in:['applied', 'invited', 'directOffer', 'hired', 'close', 'inReview', 'changesRequired', 'completed']}}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.hiredList = function (req, res, next) {
    Conversation.getPopulateInfluencer({$and: [{advertiserId: req.params.id, status: { $in:['hired','inReview','directOffer','changesRequired','completed']}}]}, function(err, result) {
        if (!err) {
            console.log("<><><><>result", result);
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all AppliedCampaigns. */
exports.getAll = function (req, res, next) {
    Conversation.getAllByQuery({influencerId: req.params.id, status: 'applied' }, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};




/** updateAppliedCampaign function to update Conversation by id. */
exports.remove = function (req, res, next) {
    Conversation.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all Conversations. */
exports.myCampaign = function (req, res, next) {
    Conversation.getAllById({influencerId: req.params.id }, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

