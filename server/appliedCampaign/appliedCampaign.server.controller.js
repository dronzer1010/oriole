/* jshint node: true */
'use strict';

var AppliedCampaign = require('./appliedCampaign.server.model').AppliedCampaign,
    Influencer = require('../influencer/influencer.server.model').Influencer,
    Boom = require('boom'),
    paypal = require('../paypal/paypal.server.controller');
/** create function to create AppliedCampaign. */
exports.create = function (req, res, next) {

    req.session.currenturl = req.body.currenturl;
    
    delete req.body.currenturl;

    if(req.body.status == "hired"){

         Influencer.get({_id: req.body.influencerId}, function(err, result) {
            if (!err) {
                paypal.paypalPayment(req, res, result.paypalSetting.paypalEmail);
            }
         });
    }
    else{  
       
        AppliedCampaign.create(req.body, function(err, result) {
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
        AppliedCampaign.update({_id: req.params.id}, req.body, function(err, result) {
            console.log("updateById", err, result);
            if (!err) {
                    return res.json(result);  
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
};

/** create function to create AppliedCampaign. */
exports.closeCampaign = function (req, res, next) {
    AppliedCampaign.updateById({'influencerId': req.params.id, status: 'hired'}, {status: 'close'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAppliedCampaign function to get AppliedCampaign by id. */
exports.getSingle = function (req, res, next) {
    AppliedCampaign.get({campaignId: req.params.id, 
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
    AppliedCampaign.getAllByQuery({advertiserId: req.params.id, status: 'applied'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.applicantList = function (req, res, next) {
    AppliedCampaign.getPopulateInfluencer({advertiserId: req.params.id, status: 'applied'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.hiredList = function (req, res, next) {
    AppliedCampaign.getPopulateInfluencer({advertiserId: req.params.id, status: 'hired'}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all AppliedCampaigns. */
exports.getAll = function (req, res, next) {
    AppliedCampaign.getAllByQuery({influencerId: req.params.id, status: 'applied' }, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};



/** updateAppliedCampaign function to update AppliedCampaign by id. */
/*exports.update = function (req, res, next) {
    AppliedCampaign.update({_id: req.params.id}, req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};*/

/** updateAppliedCampaign function to update AppliedCampaign by id. */
exports.remove = function (req, res, next) {
    AppliedCampaign.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all AppliedCampaigns. */
exports.myCampaign = function (req, res, next) {
    AppliedCampaign.getAllById({influencerId: req.params.id }, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

