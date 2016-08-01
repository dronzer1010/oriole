/* jshint node: true */
'use strict';

var InstagramMedia = require('./instagramMedia.server.model').InstagramMedia,
    Boom = require('boom'),
    fileUpload = require('../fileManagement/awsFileUpload'),
    request = require('request'),
    async = require('async');

/** create function to create instagramMedia. */
exports.create = function (req, res, next) {
    InstagramMedia.create(req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.createList = function (req, res, next) {
  var imageList = req.body;
  var excutionCount = 0;
  for (var i = 0; i < imageList.length; i++) {
    InstagramMedia.create(imageList[i], function(err, result) {
        excutionCount = excutionCount + 1;
        if(excutionCount == imageList.length){
          return res.json({message:'images saved succufully'});
        }
    });
  }
};


exports.getInstagramRecentMediaNotSaved = function (req, res) {
    var url = 'https://api.instagram.com/v1/users/'+req.user.instagram.data.id+'/media/recent/?count=1000&access_token='+req.user.accessToken+'&max_id='+req.query.max_id;
    //var params = {access_token: req.user.accessToken, max_id: req.query.max_id, count: -1};
    request.get({url:url, json:true,timeout: 50000}, function (e, r, medias){
        if(medias !== undefined){
        var instagramMedias = medias.data;
        if(typeof instagramMedias == 'undefined' || instagramMedias.length === 0 ){ 
            return res.json({exist: false});
        }
        var max_id = instagramMedias[instagramMedias.length - 1].id;
        var returnFiltedList = fillterSavedMedia(instagramMedias, req.user.instagram.data.id,
            function(err, result){
                if(err) return res.send(Boom.badImplementation(err));
                return res.json({medias:result, max_id:medias.pagination.next_max_id});
            });
        }
        
    });
};

exports.getInstagramMostLikedMediaNotSaved = function (req, res) {
    var url = 'https://api.instagram.com/v1/users/self/media/liked/';
    
    var params = {access_token: req.user.accessToken, max_like_id: req.query.max_id, count: parseInt(req.query.count)};
    request.get({url:url, qs: params, json:true}, function (e, r, medias){
        var instagramMedias = medias.data;
        if(typeof instagramMedias == 'undefined' || instagramMedias.length === 0 ){ 
            return res.json({exist: false});
        }
        var max_id = instagramMedias[instagramMedias.length - 1].id;
        var returnFiltedList = fillterSavedMedia(instagramMedias, req.user.instagram.data.id,
            function(err, result){
                if(err) return res.send(Boom.badImplementation(err));
                return res.json({medias:result, max_id:medias.pagination.next_max_id});
            });
    });
};

exports.saveMediaOfIntialzation = function(user_instagramId, accessToken, callback){
    var url = 'https://api.instagram.com/v1/users/self/media/recent/';
    var params = {access_token: accessToken, count:30};
    request.get({url:url, qs: params, json:true}, function (e, r, medias){
        var instagramMedias = medias.data;
        if(typeof instagramMedias == 'undefined' || instagramMedias.length === 0 ){ 
            instagramMedias = [];
            callback(null, true);
        }else{
            savedMediasList(user_instagramId, instagramMedias,
            function(err, result){
                if(result) callback(null, true);
            });      
        }
        
    });
};

var arrangeOBjectMedia = function(user_instagramId, media){
    return media = {
        instagramId : user_instagramId,
        images: {
            low_resolution : media.images.low_resolution.url,
            thumbnail : media.images.thumbnail.url,
            standard_resolution : media.images.standard_resolution.url
        },
        count: media.likes.count,
        mediaId: media.id
    };
};

var validateAvailabilitMedia = function(mediaList, media){
    for (var i = mediaList.length - 1; i >= 0; i--) {
        if(mediaList[i].id == media.id) return true;
    }
    return false;
};

var savedMediasList = function(user_instagramId, mediaList, callback){
    var excutionCount = 0;
    for (var i = 0; i < mediaList.length; i++){
        InstagramMedia.create(arrangeOBjectMedia(user_instagramId, mediaList[i]), 
            function(err, result) {
                excutionCount++;
                if(excutionCount == mediaList.length){
                    callback(null, true);
                }
            });
    }
};

var fillterSavedMedia = function(mediaList, instagramId, callback){
    InstagramMedia.get({instagramId: instagramId}, function(err, result){
        if (!err){
            if(result === null) callback(err, null);
            else {
                var savedMedias = result;
                for (var i = 0; i < mediaList.length; i++){
                    var instagramMedia = mediaList[i];
                    for (var j = 0; j < savedMedias.length; j++){
                        var savedMedia = savedMedias[j];
                        if(savedMedia.mediaId == instagramMedia.id){
                            mediaList.splice(i, 1);
                            i--;
                            break;
                        }
                    }      
                }
                callback(null, mediaList);
            }
        } else {
            console.log("error", "fillterSavedMedia", err);
            callback(err, null); // 500 error
        }
    });
};



/** getinstagramMedia function to get instagramMedia by userid. */
exports.getByInstagramId = function (req, res, next) {
    InstagramMedia.get({instagramId: req.params.instagramId}, function(err, result) {
        if (!err) {
            if(result === null) return res.json({exist: false});
            else return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};


exports.getById = function (req, res, next) {
    InstagramMedia.get({_id: req.params.id}, function(err, result) {
        if (!err) {
            if(result === null) return res.json({exist: false});
            else return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};


/** remove function by id. */
exports.remove = function (req, res, next) {
    InstagramMedia.removeById(req.params.id, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};


exports.removeList = function(req, res, next){
    var imageList = req.body;
    var excutionCount = 0;
    for (var i = 0; i < imageList.length; i++) {
        InstagramMedia.removeById(imageList[i]._id, function(err, result) {
            excutionCount = excutionCount + 1;
            if(excutionCount == imageList.length){
              return res.json({message:'images saved succufully'});
            }
        });

    }
};
