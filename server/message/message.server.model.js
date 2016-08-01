/**
 * Module dependencies.
 */
var config = require('../config/config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var redis = require("redis"),
    redisClient = redis.createClient(config.redisConfig);


redisClient.on("error", function (err) {
    console.log("Error " + err);
});



var MessageSchema = new Schema({
    recipient: {type: String},
    sender: {type: String},
    recipientType: {type: String},
    conversation: {type: String},
    message: {type: String},
    heading: {type: String},
    type: {
        type: String,
        enum: ['normal', 'applying', 'inviting', 'hiring', 'workSubmit', 'changeRequest', 'completed']
    },
    timeSent: {type: Date, default: Date.now, required: true, index: true},
    statusChanged: {type: Boolean},
    fileLink: {type: String},
});
var Conversation = require('../conversation/conversation.server.model').Conversation;

/** Functions for message schema's **/
var messageCacheSize = 40;
var bulkSize = 3;
var messageQueueKey = "messageQueue";
var changedConversationsKey = "changedConversations";

MessageSchema.statics = {

    /**
     * Load
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */





    create: function (data, callback) {

        console.log("Create ")
        data.timeSent = new Date();
        var query = {
            _id: data.conversation
        }

        console.log(data.timeSent);
        var update = {
            lastMessage: data.message,
            updated_at: new Date()
        }

        Conversation.update(query, update, null, function (err, res) {
            console.log('naveen is here');
            if(err)
                console.log(err);
        });
        redisClient.llen(messageQueueKey, function (err, len) {
            redisClient.sadd(changedConversationsKey,data.conversation,function(err,res){});
            redisClient.lpush(data.conversation, JSON.stringify(data),function(err,res){});
            redisClient.lpush(messageQueueKey, JSON.stringify(data), function (err, res) {

                if (len + 1 > bulkSize) {
                    console.log("dumping all to db inside create");
                    dumpAllToDb();

                }


                callback(null, data);
            });

        });


    },


    getByOffset: function (data, callback) {




        var key = data.conversationId;


        redisClient.sismember(changedConversationsKey,key,function (err,ismember) {

            function next() {
                redisClient.llen(key, function (err, cnt) {

                    if (cnt < (data.offset + data.n) && !data.end) {
                        console.log("Cache miss");
                        handleCacheMiss(key, data, callback);

                    }
                    else {
                        handleCacheHit(key, data, callback);
                    }

                });

            }

            if(ismember && data.offset == 0)
                dumpAllToDb(next);
            else
                next();

        });
    }

};


var message = mongoose.model('Message', MessageSchema);

/** export schema */
module.exports = {
    Message: message
};


/** Cache miss and hit functions **/


/** Cache miss is a recursive function , after populating enough documents in the cache it agains
 * call the getByOffset to handle the query
 */




var handleCacheMiss = function (key, data, callback) {


        redisClient.lrange(key, -1, -1, function (err, lastMessageS) {


            var lastTime = 'ffffffffffffffffffffffff';
            console.log(lastMessageS);
            if (lastMessageS && lastMessageS.length > 0) {
                console.log("taking from cache last message");
                var lastMessage = JSON.parse(lastMessageS);
                lastTime = lastMessage._id;
            }


            console.log("Last time is ");
            console.log(lastTime);
            var query = {

                conversation: key,
                _id: {$lt: lastTime}

            };
            console.log(query);

            message.find(query).sort({'_id': -1}).limit(messageCacheSize).exec(function (err, results) {

                if (err) {
                    return console.log(err);
                }
                redisClient.llen(key, function (err, cnt) {

                    if (cnt < (data.offset + data.n) && !data.end) {
                        if (results.length < messageCacheSize)
                            data.end = true;

                        console.log(results);
                        for (var i = 0; i < results.length; ++i) {
                            redisClient.rpush(key, JSON.stringify(results[i]), function (err, res) {
                                if (err)
                                    console.log(err);
                            });
                        }
                    }

                    message.getByOffset(data, callback);
                });

            });

        });



}

var handleCacheHit = function (key, data, callback) {


    var start = parseInt(data.offset);
    var end = parseInt(data.n);
    console.log(start);
    console.log(end);


    redisClient.lrange(key, start, start + end - 1, function (err, res) {

        console.log("Inside cache hit");
        console.log(res);

        if (err)
            return console.log(err);

        var finalRes = [];
        for (var i = 0; i < res.length; ++i) {
            finalRes.push(JSON.parse(res[i]));
        }
        callback(null, finalRes);
    });
    redisClient.expire(key,1000,function(err,res){});

}


var dumpAllToDb =  function (next) {


    redisClient.lrange(messageQueueKey, 0, -1, function (err, res) {
        if (err)
            return console.log(err);
        /** Parse JSON from messages **/
        if (res.length <= 0) {
            if (typeof next === "function")
                next();
            return;
        }
        var newRes = [];
        for (var i = 0; i < res.length; ++i) {

            newRes.push(JSON.parse(res[i]));
        }
        /** Bulk insert **/
        console.log(newRes[0]);

        message.collection.insert(newRes,{ordered:true}, function (err) {
            if (err)
                console.log(err);
            if (typeof next === "function")
                next();
        });

        redisClient.del(messageQueueKey,function(err,res){});
        redisClient.del(changedConversationsKey,function(err,res){});

    });
}