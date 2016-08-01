/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    emailService = require("../config/emailService");

var HelpSchema = new Schema({
  advertiserId: { type: Schema.ObjectId, ref: 'advertiser' },
  pageName: { type: String },
  backgroundPhotoUrl: { type: String },
  backgroundColor: { type: String},
  frameLayout: {
    col: { type: String },
    row : { type: Boolean, default: false }
  },
  tiles:[{title: {type:String},url:{type:String},color: { type: String}}],
  frameBorderColor: {type:String},
  frameBorderRadius: {type:String},
  wildCardUrl: {type:String}
});

HelpSchema.index({ email: 1, hashtags: 1 });
HelpSchema.statics = {
  /**
   * Load
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
    get: function(query, callback) {
        this.findOne(query, callback);
    },
    getAll: function(query,callback) {
        this.find(query, function(error, items) {
            callback(error, items);
        });
    },
    removeById: function(removeData, callback) {
        this.findOneAndRemove(removeData,callback);
    },
    create: function(data, callback) {
        var help = new this(data);
        help.save(callback);
    },
    updateBy: function(query, updateData, callback) {
       this.update(query, {$set: updateData}, callback);
    },
    updatehelpPage: function(query, updateData, callback) {
       this.update(query, {$push: updateData}, callback);
    },
    removeHelpPage: function(query, updateData, callback) {
       this.update(query, {$pull: updateData}, callback);
    }
};

HelpSchema.pre('save', function(next){
  now = new Date();

  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});
var help = mongoose.model('Help', HelpSchema);

/** export schema */
module.exports = {
    Help: help
};