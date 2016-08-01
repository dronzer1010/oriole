/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    emailService = require("../config/emailService");

var AdvertiserSchema = new Schema({
  name: { type: String },
  email: { type: String },
  preferredTimezone: { type: String},
  company: { type: String },
  department: { type: String },
  phonenumber: {type: String},
  status: {type: String, enum: ['Pending', 'Accept', 'Declined', 'Verified', 'NotVerified']},
  profile: { type: String },
  campaignStatus: { type: Boolean, default: true },
  campaignUpdate: { type: Boolean, default: true },
  message: {  type: Boolean, default: true },
  expausUpdate: { type: Boolean, default: true },
  verified: { type: Boolean, default: false },
  language: { type: String },
  created_at    : { type: Date },
  accessToken: { type: String },
  instagramId: { type: String },
  userLevel: { type: String, enum: ['Standard', 'Subscriber','Trial'],default: 'Trial'},
  preferredLanguage: { type: String },
  bestTimeToPost: { type: String},
  followerDemographics: { type: String },
  tags: { type: String },
  isTokenValid: { type: String },
  hashtags: [{name: {type:String},data:{type:String},created_at: { type: Date, default: Date.now}}],
  resellerId: { type: Schema.ObjectId, ref: 'user' },
  created_at: { type: Date, default: Date.now}
});

AdvertiserSchema.index({ email: 1, hashtags: 1 });
AdvertiserSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
  
    get: function(query, callback) {
        this.findOne(query, callback);
    },
    getByTagDate: function(query, match, callback) {
        this.find(query,match, callback);
    },
    getPending: function(data, callback) {
        this.find(data, function(error, items) {
            callback(error, items);
        }).select({"company":1,"name":1,"email":1,"department":1,"phonenumber":1,"created_at":1});
    },
    getAll: function(query,callback) {
        this.find(query, function(error, items) {
            callback(error, items);
        }).select({"company":1,"name":1,"email":1,"department":1,"phonenumber":1,"userLevel":1,"created_at":1});
    },
    getDataforAnalytics: function(query,callback) {
        this.find(query, function(error, items) {
            callback(error, items);
        }).select({"instagramId":1,"accessToken":1});
    },
    getAdvertiserIds: function(query,callback) {
        this.find(query, callback).select({"_id": 1});
    },
    updateById: function(id, updateData, callback) {
      this.findOne(id, function(error, items) { 
          for(var key in updateData){    
              emailService.invite(items, function(error, data){
                items['verified'] = false;
              });
            items[key] = updateData.status;
          }
         items.save(callback);
      });
    },
   updateLink: function(id, updateData, callback) {
      this.findOne(id, function(error, items) {
          if(items.verified === true){
            callback(null, "User already verified");
          }
          else{  
            for(var key in updateData){ 
              items[key] = updateData[key];
            }
            items.save(callback);
          }
      });
    },
    removeById: function(removeData, callback) {
        this.findOneAndRemove(removeData,callback);
    },
    create: function(data, callback) {
        var advertiser = new this(data);
        advertiser.save(callback);
    },
    updateBy: function(query, updateData, callback) {
       this.update(query, {$set: updateData}, callback);
    },
    updateHashTags: function(query, updateData, callback) {
       this.update(query, {$push: updateData}, callback);
    },
    removeHashTag: function(query, updateData, callback) {
       this.update(query, {$pull: updateData}, callback);
    },
    removestat: function(query, updateData, callback) {
       this.update(query, {$unset: updateData}, callback);
    }
};

AdvertiserSchema.pre('save', function(next){
  now = new Date();

  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});
var advertiser = mongoose.model('Advertiser', AdvertiserSchema);

/** export schema */
module.exports = {
    Advertiser: advertiser
};