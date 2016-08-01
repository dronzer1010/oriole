/* jshint node: true */
'use strict';

var CTA = require('./CTA.server.model').CTA ,
	Boom = require('boom') ,
	async = require('async');

/** create function to create CTA . */

exports.create = function(req , res ,next){

	CTA.create(req.body , function(err , result){
		if(!err){
			return res.json(result);
		}else{
			return res.send(Boom.badImplementation(err));
		}
	});

};
exports.getAll = function(req , res ,next){
	
	CTA.getAll({CTAAdvertiserId: req.params.advertiserId} , function(err , result){
		if(!err){
			return res.json(result);
		}else{
			return res.send(Boom.badImplementation(err));
		}
	});

};
