/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var oAuthTypes = [
  'instagram'
];

var UserSchema = new Schema({
  name: { type: String },
  email: { type: String},
  username: { type: String },
  accessToken: { type: String },
  hashed_password: { type: String},
  salt: { type: String},
  user: { type: String, enum: ['Admin', 'Advertiser', 'Influencer','Reseller']},
  provider: { type: String},
  created_at    : { type: Date },
  instagram: {},
  startdate: { type: String },
  enddate: { type: String },
  company: { type: String },
  resellerApiKey: { type: String },
  status: { type: String, enum: ['Verified', 'NotVerified','Accept']}
});

/**Indexing*/
UserSchema.index({ email: 1 });
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() { return this._password; });

UserSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
   load: function (options, cb) {
      options.select = options.select;
      this.findOne(options.criteria)
        .select(options.select)
        .exec(cb);
    },

    get: function(id, callback) {
        this.findOne(id, callback);
    },
    getAll: function(query, callback) {
        this.find(query, callback).select({"company":1,"name":1,"email":1,"startdate":1,"enddate":1});
    },
    updateBy: function(query, updateData, callback){
       this.update(query, {$set: updateData}, callback);
    },
    findOneAndUpdate: function(query, setter, options, callback){
      this.findOneAndUpdate(query, {$set: setter}, options, callback);
    },
    getByInstagramId: function(query,callback){
      this.findOne(query, callback);
    },
    updateById: function(query, updateData, callback) {
      this.findOne(query, function(error, result){
        if(error){
          callback(error);
        }
        else{
          var password = updateData.newPassword;
          var salt = Math.round((new Date().valueOf() * Math.random())) + '';
         
          if (!password) return '';
              try {
               password = crypto
                  .createHmac('sha1', salt)
                  .update(password)
                  .digest('hex');
              } catch (err) {
                return '';
              }
          
            result.salt = salt;
            result.hashed_password = password;
            result.save(callback);
          }
      });
    },
    removeById: function(removeData, callback) {
        this.findOneAndRemove(removeData,callback);
    },
    create: function(data, callback) {
        var user = new this(data);
        user.save(callback);
    }
};



/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if ( !this.created_at ) {
    this.created_at = new Date();
  }
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

var validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Methods
 */

UserSchema.methods = {

  skipValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
};


var user = mongoose.model('User', UserSchema);

/** export schema */
module.exports = {
    User: user
};

