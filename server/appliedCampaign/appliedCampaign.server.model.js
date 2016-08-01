/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * @module campaignBookmark
 * @description contain the details of campaignBookmark information, conditions and actions.
 */

var AppliedCampaignSchema = new Schema({
  influencerId: { type: Schema.ObjectId, ref: 'influencer' },
  campaignId: { type:  Schema.ObjectId, ref: 'campaign' },
  advertiserId: { type:  Schema.ObjectId, ref: 'advertiser' },
  status: { type: String, enum: ['applied', 'invited', 'directOffer', 'hired', 'close', 'inReview', 'changesRequired', 'completed']},
  price: { type: String },
  message: { type: String },
  pay_key: { type: String }
});

/**Indexing*/
AppliedCampaignSchema.index({ influencerId: 1, campaignId: 1, advertiserId: 1 });
/**
  findcampaignBookmark. return the campaignBookmark objects.
  @param callback: callback of this form.
*/

/**
  findcampaignBookmark. return the campaignBookmark objects.
  @param callback: callback of this form.
*/
AppliedCampaignSchema.statics = {
  getAllByQuery: function (query, callback) {
    this.find(query, {campaignId: 1, influencerId: 1, _id: 0}, callback);
  },

  getPopulateInfluencer: function (query, callback) {
    this
    .find(query)
    .populate('influencerId')
    .exec(callback);
  },

  getAllById: function (query, callback) {
    this
      .find(query, {_id: 0, advertiserId: 0})
      .populate('campaignId')
      .exec(callback);
  },
/**
  findOnecampaignBookmark. return the one campaignBookmark object.
  @param id: get id to find one campaignBookmark by id.
  @param callback: callback of this form.
*/
  get: function (query, callback) {
    this.findOne(query, callback);
  },

/**
  createcampaignBookmark. return the create campaignBookmark object result.
  @param data: data is use to create new campaignBookmark.
  @param callback: callback of this form.
*/
  create: function (data, callback) {
    var appliedCampaign = new this(data);
    this.findOne({influencerId: data.influencerId, campaignId: data.campaignId}, function(err, result){
      if(result === null)  appliedCampaign.save(callback);
      else if(data.status == "hired"){
        if(result.status !== "invited" || result.status !== "applied"){
          appliedCampaign.status = "directOffer";
          appliedCampaign.save(callback);
        }
        else{
          appliedCampaign.save(callback);
        }
      }
      else if(result.status == data.status) callback(null, "data already exist");
      else if(err) callback(err);
      else{
         appliedCampaign.save(callback);
      }
    });
  },

/**
  updatecampaignBookmark. return the create campaignBookmark object result.
  @param updateData: updateData is use to update campaignBookmark w.r.t id.
  @param callback: callback of this form.
*/
  updateById: function (query, updateData, callback) {
    if(updateData.price && updateData.status == "completed"){
      this.findOne(query, function(err, result){
        if(err) callback(err);
        else{
          result.price = result.price + updateData.price;
          result.status = "completed";
          result.save(callback);
        }
      });
    }
    else{
      this.update(query, {$set: updateData}, callback);
    }
  },

/**
  removeUser. return the create campaignBookmark object result.
  @param removeData: removeData is use to remove campaignBookmark w.r.t id.
  @param callback: callback of this form.
*/
  remove:function (removeData, callback) {
      removeData.remove();
  }
};

var appliedCampaign = mongoose.model('appliedCampaign', AppliedCampaignSchema);

/** export schema */
module.exports = {
    AppliedCampaign: appliedCampaign
};