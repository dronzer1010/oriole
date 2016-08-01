/* jshint node: true */
'use strict';

var Message = require('./message.server.model').Message,
    Boom = require('boom'),
    paypal = require('../paypal/paypal.server.controller');

var pageSize = 10;

/** create function to create Message. */
exports.create = function (req, res, next) {
    console.log(req.body.status);
    if(req.body.status == "hired"){
        paypal.paypalPayment(req, res);
    }
    else{
        Message.create(req.body, function(err, result) {
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
    if(req.body.status == "hired" || req.body.price || req.body.status == 'completed'){
        paypal.paypalPayment(req, res);
    }
    else{
        Message.update({_id: req.params.id}, req.body, function(err, result) {
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
};

exports.getByOffset = function (req,res,next){

    var data = {
        conversationId:req.query.conversationId,
        offset: req.query.offset,
        n: pageSize
    }
    console.log("getting by offset\n");
    console.log(data);

    Message.getByOffset(data,function (err,result) {
        if(!err)
            return res.json(result);
        else {
            return res.send(Boom.badImplementation(err));
        }

    });

}

/** get all message realated to user. */
exports.getAllMessagesRelatedToUser = function (req, res, next) {
    Message.getAllByQuery({$or: [{recipient: req.params.userId}, {sender: req.params.userId}]},
        function(err, result){
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
};


exports.getLatestMessageRelatedToConversation = function (req, res, next) {
    console.log("getLatestMessageRelatedToConversation", req.params.conversationId);
    Message.getLatest({conversation: req.params.conversationId},
        function(err, result){
            console.log("result", result.message);
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
};

/** create function to create Message. */
exports.closeCampaign = function (req, res, next) {
    Message.updateById({'influencerId': req.params.id, status: 'hired'}, {status: 'close'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAppliedCampaign function to get Message by id. */
exports.getSingle = function (req, res, next) {
    Message.get({campaignId: req.params.id,
            influencerId: req.query.influencerId,
            advertiserId: req.query.advertiserId},
        function(err, result) {
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
};

exports.appliedCampaignOfAdvertiser = function (req, res, next) {
    Message.getAllByQuery({advertiserId: req.params.id, status: 'applied'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.applicantList = function (req, res, next) {
    Message.getPopulateInfluencer({advertiserId: req.params.id, status: 'applied'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.hiredList = function (req, res, next) {
    Message.getPopulateInfluencer({advertiserId: req.params.id, status: 'hired'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all AppliedCampaigns. */
exports.getAll = function (req, res, next) {
    Message.getAllByQuery({influencerId: req.params.id, status: 'applied' }, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};




/** updateAppliedCampaign function to update Message by id. */
exports.remove = function (req, res, next) {
    Message.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all Messages. */
exports.myCampaign = function (req, res, next) {
    Message.getAllById({influencerId: req.params.id }, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

