/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InstagramTokenTokenSchema = new Schema({
  instagramTokenId: { type: String },
  accessToken: { type: String }
});


InstagramTokenTokenSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

   get: function (id, callback) {
    this.findOne({'accessToken': id}, function(error, items){
	    callback(error, items);
	});
   },

   create: function (data, callback) {
   	var instagramToken = new this(data);
    instagramToken.save(callback);
   }
};

var instagramToken = mongoose.model('instagramToken', InstagramTokenTokenSchema);

/** export schema */
module.exports = {
    InstagramToken: instagramToken
};

