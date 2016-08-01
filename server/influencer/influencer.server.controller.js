/* jshint node: true */
'use strict';
var _this = this;
var Influencer = require('./influencer.server.model').Influencer,
    Analytics  = require('../analytics/analytics.server.controller'),
    Boom = require('boom'),
    request = require('request'),
    async = require('async'),
    emailService = require("../config/emailService");

/** create function to create influencer. */
exports.create = function (req, res, next) {

    Influencer.updateById({instagramId: req.body.instagramId}, req.body, function(err, result) {
        console.log("after update", err, result);
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
     });
};

/** getinfluencer function to get influencer by id. */
exports.get = function (req, res, next) {
    Influencer.get({instagramId: req.params.instagramId}, function(err, result) {
        if (!err) {
            if(result === null) return res.json({exist: false});
            else return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

//code to check Influencer Existence
exports.checkInfluencerExistence = function (req, res, next) {
    Influencer.checkInfluencerExistence({instagramId: req.params.instagramId}, function(err, result) {
        if (!err) {
            if(result === null) return res.json({exist: false});
            else return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
/** getinfluencer function to get influencer by id. */
exports.getSingle = function (req, res, next) {
    Influencer.get({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
exports.getById = function (req, res, next) {
    Influencer.dataForAdvertiser({_id: req.params.id}, function(err, result) {
        if (!err) {
            if(result === null) return res.json({exist: false});
            else return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.getAppFollowersCount = function (req, res, next) {
    Influencer.getAppFollowersCount({}, function(err, result) {
        var appfollowerCount = 0.0;
        result.forEach(function (item) {
          console.log(item.followed_by);
          if(item.followed_by !=undefined)
          appfollowerCount += parseInt(item.followed_by,10);
        });
        return res.json(appfollowerCount);
    });
};

/** getAll function to get all influencers. */
exports.getAll = function (req, res, next) {  
    var query;
    console.log(req.query.category);
    if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined  && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log("Case 1");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]}
                       
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 2");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                       
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 3");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                       
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 4");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log("Case 5");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                       
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
       console.log("Case 6");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]}
                       
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log("Case 7");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]}
                       
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log("Case 8");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                  ]};
                       
        
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log("Case 9");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]}
                  ]};
                       
        
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      //this is the default case
      console.log('Default Case');
      query ={
                      $and: [
                      {$or: [
                        { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                        { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]}
                       ]},
                      {$or: [
                        { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                        { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]}
                       ]},
                      {$or: [
                        { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                        { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                       ]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 92nd");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                  ]};
                       
        
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log("Case 10");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]}
                  ]};
                       
        
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log("Case 11");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
                       
        
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log("Case 12");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log("Case 13");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 14");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 15");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 16");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 17");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 18");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 19");
        query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 20");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 21");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 22");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
       console.log("Case 23");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log("Case 24");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
       console.log("Case 25");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
       console.log("Case 26");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
         console.log("Case 27");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
       console.log("Case 28");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 29");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log("Case 30");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
       console.log("Case 31");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log("Case 32");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 33");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
       console.log("Case 34");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]},

                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 35");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 36");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 37");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 38");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 39");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 40");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 41");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 42");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 43");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 44");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 45");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice === '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 46");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 47");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 48");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
       console.log("Case 49");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log("Case 50");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log("Case 51");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log("Case 52");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 53");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 54");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 55");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 56");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 57");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 58");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 59");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log("Case 60");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 61");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 62");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 63");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 64");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 65");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log("Case 66");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 67");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 68");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 69");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower === '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 70");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 71");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 72");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 73");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 74");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 75");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 76");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 77");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 78");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 79");
      query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
       console.log("Case 80");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 81");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus === '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 82");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 83");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 84");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                      
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 85");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 86");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]}
                     
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 87");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                     
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 88");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{"aboutMe.city": {'$regex': req.query.chosenPlace,$options: '-i'}}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]}
                     
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 89");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log("Case 90");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 91");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{ "aboutMe.category": req.query.category}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log("Case 92");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log("Case 93");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{ "aboutMe.gender": req.query.male}]}
                  ]};
    }
    else if(req.query.maxPrice !== '1000' && req.query.maxFollower !== '500000' && req.query.maxAgePlus !== '50' && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log("Case 94");
       query ={
                      $and: [
                      { $and : [{ "aboutMe.minPrice": { $gte: parseInt(req.query.minPrice) }},{ "aboutMe.minPrice": { $lte: parseInt(req.query.maxPrice) }}]},
                      { $and : [{ "followed_by": { $gte: parseInt(req.query.minFollower) }},{ "followed_by": { $lte: parseInt(req.query.maxFollower) }}]},
                      { $and : [{ "aboutMe.birthday": { $lte: new Date(req.query.minAge) }},{ "aboutMe.birthday": { $gte: new Date(req.query.maxAge) }}]},
                      { $and : [{ "aboutMe.gender": req.query.female}]}
                  ]};
    }

    console.log(query);

    Influencer.getPageCount(query, function(err, count) {
        Influencer.getAll(query,req.params.page, function(err, result) {
            if (!err) {
                result.push(count);
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    });
};



/** updateinfluencer function to update influencer by id. */
exports.update = function (req, res, next) {
    console.log("update", req.params.instagramId, req.body);
    console.log("update");
     Influencer.updateById({instagramId: req.params.instagramId}, req.body, function(err, result) {
        console.log("after update", err, result);
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
     });
};

/** updateinfluencer function to update influencer by id. */
exports.remove = function (req, res, next) {
    Influencer.remove({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};



exports.getInstagramProfile = function (req, res) {
  var url = 'https://api.instagram.com/v1/users/'+req.user.instagram.data.id;
  var dataReq = req.user.instagram.data;
  var params = { access_token: req.user.accessToken };
  
  request.get({url:url, qs: params, json:true}, function (e, r, user) {
    if(user !== undefined){
      var retRes = 0;
      var accessToken = req.user.accessToken;
      var instagramId = req.user.instagram.data.id;

      Influencer.getPageCount({"averageLikes": { $exists: false },instagramId: instagramId}, function(err, count) {
          console.log(count);
          if(count === 1){
            _this.mediaLikes(req, res,user.data.counts.followed_by,accessToken,instagramId,retRes);
          }
      });
      
      var url = 'https://api.instagram.com/v1/users/self/media/recent/';
      var params = { access_token: accessToken };
      var output = [];
      var tmplikeByHour = [];
      var tags =[];
      var bestTimeToPost =[];
      Influencer.getPageCount({"postingAnalytics": { $exists: false },instagramId: instagramId}, function(err, count) {
            if(count === 1){
              process.nextTick(function() {
                Analytics.processAnalytics(req,url,params,0,0,req.user.instagram.data.id,output,tmplikeByHour,tags,'Influencer',0,'noCron',bestTimeToPost);
              });
            }
      });
    }
    if(user !=undefined && user.meta!= undefined && user.meta.code == 400)
    {
      return res.json(req.user.instagram.data);
    }
    else
    {
      if(user != undefined){
        return res.json(user.data);
      }else{
        return res.json({});
      }
    }
   
  });
};

exports.mediaLikes = function (req, res,followed_by,accessToken,instagramId,retRes) {
  var url = 'https://api.instagram.com/v1/users/self/media/recent/';
  var params = { access_token: accessToken };
  request.get({url:url, qs: params, json:true}, function (e, r, user) {
    
    if (typeof(user.data) != 'undefined')
    {    var mediaCount =0;
         var totalLikes = 0;
         var totalComments = 0;
        for (var i = 0; i < user.data.length; i++) {
          totalLikes = totalLikes + user.data[i].likes.count;
          totalComments = totalComments + user.data[i].comments.count;
          mediaCount = mediaCount +1;
        }
        var object ={};
        object.followed_by = followed_by;
        object.isTokenValid = "yes";
       if(user.pagination.next_url === undefined){
          
          if(mediaCount === 0){
            object.averageLikes = 0;
            object.averageComments = 0;
          }
          else if(totalComments === 0){
             object.averageComments = 0;
             object.averageLikes = Math.round(totalLikes / mediaCount);
          }
          else{
            object.averageLikes = Math.round(totalLikes / mediaCount);
            object.averageComments = Math.round(totalComments / mediaCount);
          }
          
          //code to update the average likes and comments
           Influencer.updateById({instagramId: instagramId}, object, function(err, result) {
             //console.log(instagramId,'',result,object);
              if (!err) {
                  if(retRes === 1){
                      return res.json(object);
                  }else{
                    console.log('Likes updated');
                  }
                  
              } 
           });
          
        }
        if(user.pagination.next_url){
            request.get({url:user.pagination.next_url, json:true}, function (e, r, user2) {
               for (var i = 0; i < user2.data.length; i++) {
                mediaCount = mediaCount +1;
                totalLikes = totalLikes + user2.data[i].likes.count;
                totalComments = totalComments + user.data[i].comments.count;
                if(mediaCount === 30)break;
              }
             
              object.averageLikes = Math.round(totalLikes / mediaCount);
              object.averageComments = Math.round(totalComments / mediaCount);
              //code to update the average likes and comments
                Influencer.updateById({instagramId: instagramId}, object, function(err, result) {
                  
                  if (!err) {
                      if(retRes === 1){
                          return res.json(object);
                      }else{
                        console.log('Likes updated');
                      }
                      
                  } 
                });
             
            });
        }
    }
  });
};


exports.getInstagramProfileAd = function (req, res) {
  var url = 'https://api.instagram.com/v1/users/'+req.params.id1;
  var params = { access_token: req.params.id2 };
  request.get({url:url, qs: params, json:true}, function (e, r, user) {
    if(user !== undefined){
    if (typeof(user.data) != 'undefined')
    {
       var retRes =1 ;
       var accessToken = req.params.id2;
       var instagramId = req.params.id1;

       Influencer.getPageCount({"averageLikes": { $exists: false },instagramId: instagramId}, function(err, count) {
            
            if(count === 1){
              _this.mediaLikes(req, res,user.data.counts.followed_by,accessToken,instagramId,retRes);
            }else{
              return res.json({response: null});
            }
        });
      
      var url = 'https://api.instagram.com/v1/users/self/media/recent/';
      var params = { access_token: accessToken };
      var output = [];
      var tmplikeByHour = [];
      var tags =[];
      var bestTimeToPost =[];
      Influencer.getPageCount({"postingAnalytics": { $exists: false },instagramId: instagramId}, function(err, count) {
            if(count === 1){
              process.nextTick(function() {
                Analytics.processAnalytics(req,url,params,0,0,instagramId,output,tmplikeByHour,tags,'Influencer',0,'noCron',bestTimeToPost);
              });
            }
      });
    }else{return res.json({response: null});}}else{return res.json({response: null});}
  });
};

exports.sendMessageToInfluencer = function(req, res){
  Influencer.get({'_id': req.body.recipient}, function(err, result){
    if(result.notificationSetting.emailFromAdvertiser === true){
      emailService.messageToInfluencer(result.aboutMe.email, req.body, function(error, data){
          if(error){
              return res.send(Boom.badImplementation(error));
          }
          else{
              return res.json({message: "mail sent successfully"});
          }
      });
    }
    else{
      return res.json({message: "mail notification is not on."});
    }
  });
};