var Mongoose = require('mongoose');
var config = require('./config');

Mongoose.connect(config.database.url);

var db = Mongoose.connection;
db.on('error', console.error.bind(console, config.database.url + 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
});

exports.Mongoose = Mongoose;
exports.db = db;
