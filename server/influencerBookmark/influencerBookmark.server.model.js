/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * @module InfluencerBookmarkSchema
 * @description contain the details of InfluencerBookmarkSchema information, conditions and actions.
 */

var InfluencerBookmarkSchema = new Schema({
  influencerId: { type:  Schema.Types.ObjectId, ref: 'influencer' },
  advertiserId: { type:  Schema.Types.ObjectId, ref: 'advertiser' }
});


/**Indexing*/
InfluencerBookmarkSchema.index({ influencerId: 1, advertiserId: 1 });
/**
  findInfluencerBookmarkSchema. return the InfluencerBookmarkSchema objects.
  @param callback: callback of this form.
*/
InfluencerBookmarkSchema.statics = {
  getAll: function (query, callback) {
    this
      .find(query, {influencerId: 1})
      .populate('influencerId',{"followed_by":1,
                                 "averageLikes":1,
                                 "aboutMe.name":1,
                                 "aboutMe.city":1,
                                 "aboutMe.birthday":1,
                                 "aboutMe.gender":1,
                                 "aboutMe.category":1,
                                 "instagramId":1,
                                 "profilePhoto":1})
      .exec(callback);
  },

/**
  findOneInfluencerBookmarkSchema. return the one InfluencerBookmarkSchema object.
  @param id: get id to find one InfluencerBookmarkSchema by id.
  @param callback: callback of this form.
*/
  get: function (id, callback) {
      this.findOne({_id: id}, callback);
  },

/**
  createInfluencerBookmarkSchema. return the create InfluencerBookmarkSchema object result.
  @param data: data is use to create new InfluencerBookmarkSchema.
  @param callback: callback of this form.
*/
  create: function (data, callback) {
    var influencerBookmark= new this(data);
    this.findOne({advertiserId: data.advertiserId, influencerId: data.influencerId}, function(Error, result){
      if(!result){
          influencerBookmark.save(callback);
      }
      else{
        // callback(null, "data already exist");
        result.remove(callback(null, "unbookmarked influencer"));
      }
    });
  },

/**
  updateInfluencerBookmarkSchema. return the create InfluencerBookmarkSchema object result.
  @param updateData: updateData is use to update InfluencerBookmarkSchema w.r.t id.
  @param callback: callback of this form.
*/
  update: function (updateData, callback) {
    updateData.save(callback);
  },

/**
  removeUser. return the create InfluencerBookmarkSchema object result.
  @param removeData: removeData is use to remove InfluencerBookmarkSchema w.r.t id.
  @param callback: callback of this form.
*/
  remove: function (removeData, callback) {
      removeData.remove();
  }
};

var influencerBookmark = mongoose.model('influencerBookmark', InfluencerBookmarkSchema);

/** export schema */
module.exports = {
    InfluencerBookmark: influencerBookmark
};