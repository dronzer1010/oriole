/* jshint node: true */
'use strict';

var CampaignBookmark = require('./campaignBookmark.server.model').CampaignBookmark,
    Boom = require('boom');

/** create function to create CampaignBookmark. */
exports.create = function (req, res, next) {
    CampaignBookmark.create(req.body, function(err, result) {
         if (!err) {
            if(result == "campaign unbookmarked"){
                return res.json({message: 'campaign unbookmarked'});
            }
            else{  
                return res.json(result);
            }
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getCampaignBookmark function to get CampaignBookmark by id. */
exports.get = function (req, res, next) {
    CampaignBookmark.get({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all CampaignBookmarks. */
exports.getAll = function (req, res, next) {
    CampaignBookmark.getAllByQuery({influencerId: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};



/** updateCampaignBookmark function to update CampaignBookmark by id. */
exports.update = function (req, res, next) {
    CampaignBookmark.update({_id: req.params.id}, req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** updateCampaignBookmark function to update CampaignBookmark by id. */
exports.remove = function (req, res, next) {
    CampaignBookmark.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

