/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InstagramSchema = new Schema({
  name: { type: String },
  username: { type: String },
  provider: { type: String },
  accessToken: { type: String },
  instagramId: { type: String }
});

/**Indexing*/
InstagramSchema.index({ instagramId: 1, accessToken: 1 });

InstagramSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

   get: function (id, callback) {
    this.findOne({'instagramId': id}, function(error, items){
	    callback(error, items);
	});
   },
   create: function (data, callback) {
   	var instagram = new this(data);
    instagram.save(callback);
   }
};

var instagram = mongoose.model('Instagram', InstagramSchema);

/** export schema */
module.exports = {
    Instagram: instagram
};

