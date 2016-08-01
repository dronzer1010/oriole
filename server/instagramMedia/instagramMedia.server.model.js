/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InstagramMediaSchema = new Schema({
  instagramId: { type: String },
  mediaId: { type: String },
  images: { 
    low_resolution: String,
    thumbnail: String,
    standard_resolution: String
  },
  createTime: { type: Date, default: Date.now, index: true }
});

/**Indexing*/
InstagramMediaSchema.index({ instagramId: 1 });

InstagramMediaSchema.statics = {

  /**
      findOneinfluencer. return the one influencer object.
      @param id: get id to find one influencer by id.
      @param callback: callback of this form.
    */
  get: function (query, callback) {
      this
        .find(query)
        .sort({'createTime': -1})
        .exec(callback);
  },
  removeById: function(id, callback) {
    this.findOneAndRemove({_id:id}, callback);
  },
  create: function (data, callback) {
    var instagramMedia = new this(data);
    instagramMedia.save(callback);
  },
  updateBy: function(query, updateData, callback) {
       this.update(query, {$set: updateData}, callback);
  },
  checkMediaExistence: function(query, callback){
      this.count(query,function(err,count){
        callback(null,count);
      });
  }
};

var instagramMedia = mongoose.model('InstagramMedia', InstagramMediaSchema);

/** export schema */
module.exports = {
    InstagramMedia: instagramMedia
};

