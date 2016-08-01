/* jshint node: true */
'use strict';

var Campaign = require('./campaign.server.model').Campaign,
    Advertiser = require('../advertiser/advertiser.server.model').Advertiser,
    AppliedCampaign = require('../appliedCampaign/appliedCampaign.server.model').AppliedCampaign,
    Boom = require('boom'),
    async = require('async');

/** create function to create campaign. */
exports.create = function (req, res, next) {
    Campaign.create(req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getcampaign function to get campaign by id. */
exports.get = function (req, res, next) {
    Campaign.get({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all campaigns. */
exports.getAll = function (req, res, next) {
    Campaign.getAll({}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all campaigns. */
exports.getAllByAdvertiserId = function (req, res, next) {
    Campaign.getAll({advertiserId: req.params.advertiserId}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all campaigns. */
exports.getAllApprovedCampaign = function (req, res, next) {
    Campaign.getAll({advertiserId: req.params.advertiserId, campaignStatus: {$in:['Accept','Close']}}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** updatecampaign function to update campaign by id. */
exports.campaignUpdate = function (req, res, next) {
    Campaign.updateById({_id: req.params.id}, req.body, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** updatecampaign function to update campaign by id. */
exports.remove = function (req, res, next) {
    Campaign.removeById({_id: req.params.id}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

/** getAll function to get all advertisers. */
exports.pendingStatus = function (req, res, next) {
    var resellerId;
    if(req.session.reseller!==undefined){
        resellerId = req.session.reseller.id;
    }else if(req.session.admin!==undefined){
        resellerId = req.session.admin.id;
    }

    Advertiser.getAdvertiserIds({resellerId:resellerId}, function(err, result) {
        console.log(result)
        if (!err) {
              Campaign.getPending({campaignStatus: 'Pending','advertiserId': { $in:result}}, function(err, result) {
                  if (!err) {
                      return res.json(result);
                  } else {
                      return res.send(Boom.badImplementation(err)); // 500 error
                  }
              });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });

    
};
/** getAll function to get all advertisers. */
exports.updateStatus = function (req, res, next) {
    if(req.body.status == "Declined"){
        Campaign.updateById({_id: req.body._id}, {campaignStatus: req.body.status}, function(err, result) {
            if (!err) {
                return res.json({message: "Declined User"});
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
    else{    
        Campaign.updateById({_id: req.body._id}, {campaignStatus: req.body.status}, function(err, result) {
            if (!err) {
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); // 500 error
            }
        });
    }
};
exports.updateVisiblity = function (req, res, next) {
    Campaign.updateById({_id: req.params.id}, {visiblePrivate: req.body.visiblePrivate}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};

exports.close = function (req, res, next) {
    Campaign.updateById({_id: req.params.id}, {campaignStatus: req.body.campaignStatus}, function(err, result) {
        if (!err) {
            return res.json(result);
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
};
exports.showCampaignToInfluencer = function (req, res, next) {
    var query;   
    if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000' && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 1');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   {$and: [{campaignStatus: 'Accept', visiblePrivate: false}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log('case 2');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.male}]}
            ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 3');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 4');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log('case 5');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 6');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 7');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log('case 8');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log('case 9');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log('case 10');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log('case 11');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 12');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
         console.log('case 13');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log('case 14');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 15');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 16');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log('case 17');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 18');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 19');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
       console.log('case 20');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log('case 21');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log('case 22');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log('case 23');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus === '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 24');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "targetAge.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 25');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log('case 26');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log('case 27');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log('case 28');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log('case 29');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log('case 30');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log('case 31');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log('case 32');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
      console.log('case 33');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log('case 34');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log('case 35');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice === '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 36');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]},
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 37');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log('case 38');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 39');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 40');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]}
                   
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log('case 41');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category !== undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 42');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "campaignCategory": req.query.category}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
        console.log('case 43');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
        console.log('case 44');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace !== undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 45');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{"area": {'$regex':  req.query.chosenPlace,$options: '-i'}}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === 'female'){
      console.log('case 46');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === 'male' && req.query.female === undefined){
      console.log('case 47');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.male}]}
        ]};
    }
    else if(req.query.maxAgePlus !== '50' && req.query.maxPrice !== '1000'  && req.query.chosenPlace === undefined && req.query.category === undefined && req.query.male === undefined && req.query.female === 'female'){
        console.log('case 48');
        query ={
            $and: [
                   {$or: [
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$gte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}},{ "targetAge.from": {$lte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$gte: parseInt(req.query.maxAge)}}]},
                        { $and : [{ "targetAge.from": {$lte: parseInt(req.query.minAge)}},{ "targetAge.to": {$lt: parseInt(req.query.maxAge)}},{ "targetAge.to": {$gte: parseInt(req.query.minAge)}}]}
                   ]},
                   {$or: [
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$gte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}},{ "priceRange.from": {$lte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.maxPrice)}}]},
                        { $and : [{ "priceRange.from": {$lte: parseInt(req.query.minPrice)}},{ "priceRange.to": {$lt: parseInt(req.query.maxPrice)}},{ "priceRange.to": {$gte: parseInt(req.query.minPrice)}}]}
                   ]},
                   { $and: [{campaignStatus: 'Accept', visiblePrivate: false}]},
                   { $and : [{ "gender": req.query.female}]}
        ]};
    }
    Campaign.getPageCount(query,function(err, count) {
        Campaign.getAllByQuery(query,req.params.id, function(err, result) {
            if (!err) {
                result.push(count);
                return res.json(result);
            } else {
                return res.send(Boom.badImplementation(err)); 
            }
        });
    });
};
