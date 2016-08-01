/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * @module campaignBookmark
 * @description contain the details of campaignBookmark information, conditions and actions.
 */

var CampaignBookmarkSchema = new Schema({
  influencerId: { type:  Schema.Types.ObjectId, ref: 'influencer' },
  campaignId: { type:  Schema.Types.ObjectId, ref: 'campaign' }
});

/**Indexing*/
CampaignBookmarkSchema.index({ influencerId: 1, campaignId: 1 });
/**
  findcampaignBookmark. return the campaignBookmark objects.
  @param callback: callback of this form.
*/
CampaignBookmarkSchema.statics = {
  getAllByQuery: function (query, callback) {
    this
      .find(query, {campaignId: 1})
      .populate('campaignId',{"campaignDetail":0,
        "area":0,"gender":0,"referenceUrl":0,"advertiserId":0,"visiblePrivate":0,"targetAge":0,"dueDate":0,"campaignStatus":0})
      .exec(callback);
  },

// CampaignBookmarkSchema.statics.getAllById = function (query, callback) {
//     this.find(query, {campaignId: 1, _id: 0}, callback);
// };

/**
  findOnecampaignBookmark. return the one campaignBookmark object.
  @param id: get id to find one campaignBookmark by id.
  @param callback: callback of this form.
*/
  get: function (id, callback) {
      this.findOne({_id: id}, callback);
  },

/**
  createcampaignBookmark. return the create campaignBookmark object result.
  @param data: data is use to create new campaignBookmark.
  @param callback: callback of this form.
*/
  create: function (data, callback) {
    var campaignBookmark = new this(data);
    this.findOne({influencerId: data.influencerId, campaignId: data.campaignId}, function(Error, result){
      if(result){
        result.remove(callback(null, "campaign unbookmarked"));
      }
      else{
         campaignBookmark.save(callback);
      }
    });
  },

/**
  updatecampaignBookmark. return the create campaignBookmark object result.
  @param updateData: updateData is use to update campaignBookmark w.r.t id.
  @param callback: callback of this form.
*/
  update: function (updateData, callback) {
      updateData.save(callback);
  },

/**
  removeUser. return the create campaignBookmark object result.
  @param removeData: removeData is use to remove campaignBookmark w.r.t id.
  @param callback: callback of this form.
*/
  remove: function (removeData, callback) {
      removeData.remove();
  }
};

var campaignBookmark = mongoose.model('campaignBookmark', CampaignBookmarkSchema);

/** export schema */
module.exports = {
    CampaignBookmark: campaignBookmark
};