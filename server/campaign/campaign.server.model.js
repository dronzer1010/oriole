/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * @module campaign
 * @description contain the details of campaign information, conditions and actions.
 */

var CampaignSchema = new Schema({
  campaignTitle: { type: String },
  campaignCategory: { type: String },
  campaignDetail: { type: String },
  dueDate: { type: String },
  area: { type: String },
  priceRange: {
                from: { type: Number },
                to: { type: Number }
              },
  targetAge: {
                from: { type: Number },
                to: { type: Number }
              },
  gender: { type: String },
  visiblePrivate:  { type: Boolean, default: false },
  referenceUrl: { type: String },
  campaignImage: { type: String },
  advertiserId: { type:  Schema.Types.ObjectId, ref: 'advertiser' },
  campaignStatus: {type: String, enum: ['Draft', 'Pending', 'Accept', 'Declined', 'Close']},
});

/**
  findcampaign. return the campaign objects.
  @param callback: callback of this form.
*/
CampaignSchema.index({ advertiserId: 1, campaignStatus: 1});
var paginate = 15;
CampaignSchema.statics = {

  getAll:function (query, callback) {
      this.find(query, callback).select({"campaignDetail":0,"campaignImage":0,"campaignCategory":0,
        "area":0,"gender":0,"referenceUrl":0,"advertiserId":0});
  },


  getPageCount: function(query, callback){
      this.count(query,function(err,count){
        callback(null,count);
      });
  },

  getAdvertiserCampaignCount: function(query, callback){
      this.count(query,function(err,count){
        callback(null,count);
      });
  },

/**
  findcampaign. return the campaign objects.
  @param callback: callback of this form.
*/
  getAllByQuery: function (query, page, callback) {
      this.find(query, callback).select({"campaignDetail":0,
        "area":0,"gender":0,"referenceUrl":0,"advertiserId":0,"visiblePrivate":0,"targetAge":0,"dueDate":0,"campaignStatus":0}).skip((page-1)*paginate).limit(paginate);
  },

/**
  findOnecampaign. return the one campaign object.
  @param id: get id to find one campaign by id.
  @param callback: callback of this form.
*/
  get: function (query, callback) {
    this.findOne(query, callback);
  },

/**
  createcampaign. return the create campaign object result.
  @param data: data is use to create new campaign.
  @param callback: callback of this form.
*/
  create: function (data, callback) {
    var campaign = new this(data);
    campaign.save(callback);
  },

/**
  updatecampaign. return the create campaign object result.
  @param updateData: updateData is use to update campaign w.r.t id.
  @param callback: callback of this form.
*/
  updateById: function(query, updateData, callback) {
      this.update(query, {$set: updateData}, callback);
  },

  getPending: function(data, callback) {
    this.find(data, callback).select({"campaignTitle":1,"campaignCategory":1,"priceRange":1,"targetAge":1,"dueDate":1,"area":1,"gender":1,"campaignDetail":1,"referenceUrl":1});
  },
/**
  removeUser. return the create campaign object result.
  @param removeData: removeData is use to remove campaign w.r.t id.
  @param callback: callback of this form.
*/
  removeById: function (query, callback) {
      this.remove(query, callback);
  }
};

var campaign = mongoose.model('campaign', CampaignSchema);

/** export schema */
module.exports = {
    Campaign: campaign
};