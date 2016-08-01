/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * @module CTA
 * @description contain the details of CTA information, conditions and actions.
 */

var CTASchema = new Schema({
	CTATitle : {type : String} ,
	CTATriggerStatus : {type :Boolean ,default:true},
	CTAConditions : {
						device : { type : String} ,
						numberOfVisit : {type : Number} ,
						refURL : {type : String} ,
						refeParameter :{type : String} ,
						visitorPage : {type : String} ,
						visitorPageCount : {type : Number} ,
						schedule : {type : Date} ,
						visitorTimeOnPage : {type : Number} ,
						visitorTimeOnSite : {type : Number} ,
						visitorScrolled :{type : Boolean , default:false} ,
						visitorTag : {type : String}
					},
	CTAActionType : {type : String} ,
	CTAColorTop : {type : String} ,
	CTAColorBottom : {type : String} ,
	CTAShowTitle : {type : String} ,
	CTAShowContent : {type : String} ,
	CTAFieldName : {type : String} ,
	CTAButtonType : {type : String} ,
	CTAButtonColor : {type : String},
	CTAButtonName : {type : String} ,
	CTAButtonURL : {type : String} ,
  CTAImageURL : {type : String},
	CTAAdvertiserId :{type:  Schema.Types.ObjectId, ref: 'advertiser'}


});

CTASchema.statics = {

getAll:function (query, callback) {
      this.find(query, callback);
  },
/**
  findOneCTA. return the one CTA object.
  @param id: get id to find one CTA by id.
  @param callback: callback of this form.
*/
  get: function (query, callback) {
    this.findOne(query, callback);
  },

/**
  createCTA. return the create CTA object result.
  @param data: data is use to create new CTA.
  @param callback: callback of this form.
*/
  create: function (data, callback) {
    var CTA = new this(data);
    CTA.save(callback);
  },

/**
  updateCTA. return the create CTA object result.
  @param updateData: updateData is use to update CTA w.r.t id.
  @param callback: callback of this form.
*/
  updateById: function(query, updateData, callback) {
      this.update(query, {$set: updateData}, callback);
  },
/**
  removeUser. return the create CTA object result.
  @param removeData: removeData is use to remove CTA w.r.t id.
  @param callback: callback of this form.
*/
  removeById: function (query, callback) {
      this.remove(query, callback);
  }
}

var cta = mongoose.model('cta', CTASchema);

/** export schema */
module.exports = {
    CTA: cta
};