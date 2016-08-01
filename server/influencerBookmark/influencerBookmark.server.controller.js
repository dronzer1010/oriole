/* jshint node: true */
'use strict';

var InfluencerBookmark = require('./influencerBookmark.server.model').InfluencerBookmark,
    Boom = require('boom');

/** create function to create InfluencerBookmark. */
exports.create = function (req, res, next) {
    InfluencerBookmark.create(req.body, function(err, result) {
        if (!err) {
            if(result == "unbookmarked influencer"){
                return res.json({message: "unbookmarked influencer"});
            }
            else{
                return res.json(result);
            }
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getInfluencerBookmark function to get InfluencerBookmark by id. */
exports.get = function (req, res, next) {
    InfluencerBookmark.get({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all InfluencerBookmarks. */
exports.getAll = function (req, res, next) {
    InfluencerBookmark.getAll({advertiserId: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};



/** updateInfluencerBookmark function to update InfluencerBookmark by id. */
exports.update = function (req, res, next) {
    InfluencerBookmark.update({_id: req.params.id}, req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** updateInfluencerBookmark function to update InfluencerBookmark by id. */
exports.remove = function (req, res, next) {
    InfluencerBookmark.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
