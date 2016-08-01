/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    emailService = require("../config/emailService");

var FollowerSchema = new Schema({
  instagramId: {type:String},
  followercount:{type:String},
  created_at: { type: Date, default: Date.now}
});

FollowerSchema.index({ instagramId: 1});
FollowerSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
  
    get: function(query, callback) {
        this.find(query, callback).sort({created_at: 1});
    },
    create: function(data, callback) {
        var follower = new this(data);
        follower.save(callback);
    }
    
};


var follower = mongoose.model('Follower', FollowerSchema);

/** export schema */
module.exports = {
    Follower: follower
};