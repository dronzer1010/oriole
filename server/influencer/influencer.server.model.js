/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * @module influencer
 * @description contain the details of influencer information, conditions and actions.
 */

var InfluencerSchema = new Schema({
  aboutMe: {
    name: { type: String },
    email: { type: String },
    city: {type: String },
    minPrice: { type: Number },
    birthday: { type: Date },
    category: [{ type: String }],
    phone: { 
              countryCode: { type: String },
              phoneNumber: { type: String }
            },
    gender: { type: String }
  },
  language: { type: String},
  preferredLanguage: { type: String},
  preferredTimezone: { type: String},
  bestTimeToPost: { type: String},
  profilePhoto: { type: String },
  photos: [{ type: String }],
  paypalSetting: {
    paypalEmail: { type: String },
    emailRequested : { type: Boolean, default: false }
  },
  paymentDetails: {
    cardNo: { type: String },
    expires: { type: String },
    nameOnCard: { type: String },
    cardCode: { type: String },
    country: { type: String },
    postalCode: { type: String },
    city: { type: String }
  },
  notificationSetting: {
    emailFromAdvertiser: { type: Boolean, default: true },
    emailFromExpousTeam: { type: Boolean, default: true }
  },
  averageLikes: { type: String },
  followed_by: { type: Number },
  averageComments: { type: String },
  followerDemographics: { type: String },
  postingAnalytics: { type: String },
  tags: { type: String },
  instagramId: { type: String },
  accesstoken: { type: String },
  status: { type: String, enum: ['Verified', 'NotVerified']},
  isTokenValid: { type: String },
  created_at: { type: Date, default: Date.now}
});


/**Indexing*/
InfluencerSchema.index({ instagramId: 1, accesstoken: 1 });
var paginate = 15;

InfluencerSchema.statics = {

     /**
      findOneinfluencer. return the one influencer object.
      @param id: get id to find one influencer by id.
      @param callback: callback of this form.
    */
    get: function(query, callback) {
        this.findOne(query, callback);
    },
    checkInfluencerExistence: function(query, callback) {
        this.findOne(query, callback).select({"aboutMe.email":1,"aboutMe.gender":1,"aboutMe.minPrice":1,"paypalSetting":1});
    },
    dataForAdvertiser: function(query, callback) {
        this.findOne(query, callback).select({"followed_by":1,
                                           "averageLikes":1,
                                           "averageComments":1,
                                           "aboutMe.name":1,
                                           "aboutMe.city":1,
                                           "aboutMe.minPrice":1,
                                           "aboutMe.birthday":1,
                                           "aboutMe.gender":1,
                                           "instagramId":1,
                                           "followerDemographics":1,
                                           "tags":1,
                                           "profilePhoto":1});
    },
    /**
      findinfluencer. return the influencer objects.
      @param callback: callback of this form.
    */
    getAll: function(query, page, callback) {
        this.find(query, callback).select({"followed_by":1,
                                           "averageLikes":1,
                                           "aboutMe.name":1,
                                           "aboutMe.city":1,
                                           "aboutMe.birthday":1,
                                           "aboutMe.gender":1,
                                           "aboutMe.category":1,
                                           "instagramId":1,
                                           "profilePhoto":1}).skip((page-1)*paginate).sort({"_id":1}).limit(paginate);
    },
    getAllInfluencer: function(query,callback) {
        this.find(query, callback ).select({"instagramId":1,"accesstoken":1});
    },
    /*Get the followers count*/
    getAppFollowersCount: function(query, callback) {
        this.find(query, callback);
    },
    getPageCount: function(query, callback){
      this.count(query,function(err,count){
        callback(null,count);
      });
    },
    /**
      updateinfluencer. return the create influencer object result.
      @param updateData: updateData is use to update influencer w.r.t id.
      @param callback: callback of this form.
    */
    updateById: function(id, updateData, callback) {
        
        this.update(id, {$set: updateData},{ upsert: true }, callback);
    },
    updateBy: function(query, updateData, callback) {
       this.update(query, {$set: updateData}, callback);
    },
    remove: function(removeData, callback) {
        removeData.remove();
    },
    create: function(data, callback) {
        var influencer = new this(data);
        influencer.save(callback);
    }
};

var influencer = mongoose.model('influencer', InfluencerSchema);

/** export schema */
module.exports = {
    Influencer: influencer
};