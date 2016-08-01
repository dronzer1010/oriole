/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * @module conversation
 * @description contain the details of conversation information, conditions and actions.
 */

var ConversationSchema = new Schema({
  influencerId: { type: Schema.ObjectId, ref: 'influencer' },
  campaignId: { type:  Schema.ObjectId, ref: 'campaign' },
  advertiserId: { type:  Schema.ObjectId, ref: 'Advertiser' },
  status: { type: String, enum: ['applied', 'invited', 'directOffer', 'hired', 'close', 'inReview', 'changesRequired', 'completed']},
  price: { type: String },
  message: { type: String },
  payMethod: { type: String },
  pay_key: { type: String },
  lastMessage: {type: String},
  updated_at: { type: Date }
});

/**Indexing*/
ConversationSchema.index({ influencerId: 1, campaignId: 1, advertiserId: 1 });
/**
  conversation. return the conversation objects.
  @param callback: callback of this form.
*/

/**
  findconversation. return the conversation objects.
  @param callback: callback of this form.
*/
ConversationSchema.statics = {
  getAllByQuery: function (query, callback) {
    this.find(query, callback).select({"campaignId":1,"_id":0});
  },
  getPopulateInfluencer: function (query, callback) {
    this
    .find(query)
    .populate('influencerId',
      { "bestTimeToPost": 0,
        "postingAnalytics":0,
        "tags":0,
        "notificationSetting":0,
        "paypalSetting":0,
        "isTokenValid":0,
        "preferredTimezone":0,
        "accesstoken":0,
        "status":0,
        "photos":0,
        "language":0,
        "preferredLanguage":0,
        "campaignCategory":0
      })
    .populate('campaignId')
    .exec(callback);
  },
  applicantList: function (query, callback) {
    this
    .find(query).select({"advertiserId": 0,"lastMessage":0,"message":0,"status":0})
    .populate('influencerId',
      { "bestTimeToPost": 0,
        "postingAnalytics":0,
        "aboutMe.category":0,
        "aboutMe.city":0,
        "aboutMe.phone":0,
        "aboutMe.email":0,
        "aboutMe.gender":0,
        "aboutMe.birthday":0,
        "tags":0,
        "notificationSetting":0,
        "paypalSetting":0,
        "isTokenValid":0,
        "preferredTimezone":0,
        "accesstoken":0,
        "status":0,
        "photos":0,
        "language":0,
        "preferredLanguage":0,
        "campaignCategory":0
      })
    .populate('campaignId',{"campaignTitle":1})
    .exec(callback);
  },
  getAllByQueryAndPopulate: function (query, callback) {
    this
    .find(query).sort({"updated_at":-1}).select({"pay_key": 0})
    .populate('influencerId',{ "_id": 1,"aboutMe.name":1})
    .populate('advertiserId',{"_id": 1})
    .populate('campaignId',{"_id": 1,"campaignTitle":1})
    .exec(callback);
  },

  getAllById: function (query, callback) {
    this
      .find(query).select({advertiserId: 0,influencerId:0,lastMessage:0,message:0,updated_at:0})
      .populate('campaignId',{campaignTitle:1,campaignStatus:1,dueDate:1})
      .exec(callback);
  },
/**
  findOneconversation. return the one conversation object.
  @param id: get id to find one conversation by id.
  @param callback: callback of this form.
*/
  get: function (query, callback) {
    this.findOne(query, callback);
  },

/**
  createconversation. return the create conversation object result.
  @param data: data is use to create new conversation.
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
  updateconversation. return the create conversation object result.
  @param updateData: updateData is use to update conversation w.r.t id.
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
  removeUser. return the create conversation object result.
  @param removeData: removeData is use to remove conversation w.r.t id.
  @param callback: callback of this form.
*/
  remove:function (removeData, callback) {
      removeData.remove();
  }
};

var conversation = mongoose.model('conversation', ConversationSchema);

/** export schema */
module.exports = {
    Conversation: conversation
};