
/* jshint node: true */
'use strict';
var _this = this;
var Influencer = require('../influencer/influencer.server.model').Influencer,
    Advertiser = require('../advertiser/advertiser.server.model').Advertiser,
    InstagramMedia = require('../instagramMedia/instagramMedia.server.model').InstagramMedia,
    FollowerModel = require('../follower/follower.server.model').Follower,
    config = require('../config/config'),
    Boom = require('boom'),
    randomstring = require("randomstring"),
    async = require('async'),
    http = require('http'),
    url= require('url'),
    request = require('request');

var redisConfig;  
if (process.env.NODE_ENV === 'production') {  
  redisConfig = {
    redis: {
      port: '6379',
      host: 'redis',
      options: {
        no_ready_check: false
      }
    }
  };
} else {
  redisConfig = {};
}


var kue = require('kue')
  , queue = kue.createQueue(redisConfig);
exports.connectAdvertiserInstagramAccount = function(req, res, next) {
        var maxMediaLength = 0;
        var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';
        var params = {
          client_id: req.body.clientId,
          redirect_uri: req.body.redirectUri,
          client_secret: config.instagramConfig.clientSecret,
          code: req.body.code,
          grant_type: 'authorization_code'
        };
        // Step 1. Exchange authorization code for access token.
        request.post({ url: accessTokenUrl, form: params, json: true ,timeout: 10000}, function(error, response, body) {
           console.log(response.body);
           console.log(req.session.advertiser);
           
            if(response.body.access_token){
              var saveObject ={};
              saveObject.instagramId = response.body.user.id;
              saveObject.accessToken = response.body.access_token;
              saveObject.isTokenValid = "yes";
              var url = 'https://api.instagram.com/v1/users/self/media/recent/';
              var params = { access_token: response.body.access_token };
              var output = [];
              var tmplikeByHour = [];
              var tags =[];
              var bestTimeToPost=[];
              Advertiser.updateBy({_id: req.session.advertiser.id}, saveObject, function(err, result) {
                  process.nextTick(function() {
                    _this.processAnalytics(req,url,params,0,0,response.body.user.id,output,tmplikeByHour,tags,'Advertiser',maxMediaLength,'noCron',bestTimeToPost);
                  });
                  res.json({ token: response.body.access_token });
              });
            }
        });
};

//cron job to update the profile pictures 
exports.updateProfilePicture =function(){
     Influencer.getAllInfluencer({"aboutMe": { $exists: true },"isTokenValid": "yes"}, function(err, result) {
        if (!err) {
            result.forEach(function (influencer) {
             
              if(influencer.instagramId){ 
                if(influencer.accesstoken !== undefined){     
                  var params = { access_token: influencer.accesstoken };
                  //code to update the user profile image if it is changed
                  var job = queue.create('updateProfileImages', {
                      params: params
                    , instagramId: influencer.instagramId
                    , usertype: 'Influencer'
                  
                  }).removeOnComplete( true ).save( function(err){
                    //if( !err ) console.log(job.id );
                  });
                }
              }
            
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
        queue.process('updateProfileImages', function(job, done){
            var profileurl = 'https://api.instagram.com/v1/users/'+job.data.instagramId;
                    request.get({url:profileurl, qs: job.data.params, json:true,timeout: 5000}, function (e, r, user) {

                        if(user !== undefined && user.data !==undefined){
                          
                            var object ={};
                            object.profilePhoto = user.data.profile_picture;
                            Influencer.updateById({instagramId: job.data.instagramId}, object, function(err, result) {
                                console.log("Profile Picture updated successfully");
                                done();
                            });
                        }else{
                          done();
                        }
                    });
        });
    });  
};
exports.trackFollowersCountDaily =function(){
    Advertiser.getDataforAnalytics({"instagramId": { $exists: true },"isTokenValid": "yes"}, function(err, result) {
      console.log(result)
        if (!err) {
            result.forEach(function (advertiser) {
              if(advertiser.instagramId){      
                   var params = { access_token: advertiser.accessToken };
                   var job = queue.create('followercount', {
                        params: params
                      , instagramId: advertiser.instagramId
                    
                    }).removeOnComplete( true ).save( function(err){
                        if( !err ) console.log(job.id );
                    });
                   
              }
              
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
     });

    queue.process('followercount', function(job, done){
        var url = 'https://api.instagram.com/v1/users/'+job.data.instagramId;
        request.get({url:url, qs: job.data.params, json:true,timeout: 10000}, function (e, r, user) {
            FollowerModel.create({instagramId:job.data.instagramId,followercount:user.data.counts.followed_by},function(err,res){
              console.log("Follower count saved successfully");
              done();
            });
        });
    });
};

//function to check if user media image exists or not
exports.checkExistenceOfMediaImages = function(){
    queue.process('checkimages', function(job, done){
        console.log(url.parse(job.data.imageUrl).host,url.parse(job.data.imageUrl).pathname)
        //console.log(url.parse(job.data.imageUrl));
        request.get({url:job.data.imageUrl,timeout: 5000}, function (err,resp) {
          //console.log(resp.statusCode);
           if(resp!=undefined){
               if((resp.statusCode)==200){
                  console.log('Images Exists');
                  done();
               }else{
                  var instagramId = job.data.instagramId;
                  var accessToken = job.data.accessToken;
                  var mediaId = job.data.mediaId;
                  console.log('Images does not Exists');

                  request.get({url:'https://api.instagram.com/v1/users/self/media/recent/', qs: accessToken, json:true,timeout: 5000}, function (e, r, response) {
                       // console.log(response.data);
                        if(response !== undefined && response !== null ){
                          //parse the resposne 
                            if(response.data !== undefined && response.data !== null ){
                               var updateDone =false;
                               var incr =0;
                               var maxLength =response.data.length;
                                async.whilst(function () {
                                     return incr < maxLength;
                                },
                                function (next) {
                                      InstagramMedia.checkMediaExistence({mediaId:response.data[incr].id},function(err,count){
                                          if(count==0){
                                            console.log(incr);
                                              var newmedia = {
                                                  images: {
                                                      low_resolution : response.data[incr].images.low_resolution.url,
                                                      thumbnail : response.data[incr].images.thumbnail.url,
                                                      standard_resolution : response.data[incr].images.standard_resolution.url
                                                  },
                                                  count: response.data[incr].likes.count,
                                                  mediaId: response.data[incr].id
                                              };
                                              InstagramMedia.updateBy({mediaId:mediaId},newmedia,function(err,res){

                                                   console.log(err,res);
                                                   console.log('image updated');
                                                   incr=maxLength;
                                                   done();
                                                   next();
                                                   
                                              });
                                              
                                          }else{
                                             incr=incr+1;
                                             if(incr==maxLength)done();
                                             next();
                                          }
                                      });
                                   
                                  
                                },
                                function (err) {
                                  // All things are done!
                                });
                          }else{
                            done();
                          }
                          }else{
                            done();
                          }
                   });
                  
               }
           }else{
              done();
           }
        });
       
    });
};

//function to generate tag analytics for all the influencers
exports.processTagAnalytics = function(tagName, tagId, accessToken, instagramId, userType){
      var url = "https://api.instagram.com/v1/tags/"+tagName+"/media/recent";
      var params = {access_token: accessToken};
      var data = [];
      var randomQueue = randomstring.generate();
     
      request.get({url:'https://api.instagram.com/v1/tags/'+tagName, qs: params, json:true,timeout: 15000}, function (e, r, response) {
        console.log(e,response);
          if(response !== (undefined || null) && response.data !== undefined){
            var count =0;
            var maxMedia = response.data.media_count >1000?1000:response.data.media_count;
            var arrayCounter = 0;
            var checkJobProgress = 0;
            async.whilst(function () {
                return count < maxMedia;
            },
            function (next) {
                  request.get({url:url, qs: params, json:true,timeout: 15000}, function (e, r, response) {
                    if(response !== (undefined || null) ){
                      //parse the resposne 
                      if(response.data!==(undefined || null)){
                          response.data.forEach(function(media,index){
                               //create job queue for later processing
                              data[arrayCounter] = {created_time: media.created_time, 
                                                    likesCount: media.likes.count, 
                                                    commentsCount: media.comments.count,
                                                    instagramId:media.user.id,
                                                    username:media.user.username,
                                                    thumbnail:media.images.thumbnail.url};
                              var job = queue.create(randomQueue, {
                                              params: params
                                            , instagramId: media.user.id
                                            , arrayCounter: arrayCounter
                                          }).removeOnComplete( true ).save( function(err){
                                             //if( !err ) console.log(job.id );
                                          });
                              arrayCounter++;
                          });
                      }
                      if(response.pagination!==undefined && response.pagination.next_url !== undefined && data.length < maxMedia){
                          url = response.pagination.next_url;
                          count=count+response.data.length
                          console.log('Count-'+count);
                          next();
                      }else{
                        console.log(data.length,maxMedia);
                        queue.process(randomQueue, function(job, done){
                            var url = 'https://api.instagram.com/v1/users/'+job.data.instagramId
                            request.get({url:url, qs: job.data.params, json:true,timeout: 10000}, function (e, r, user) {
                                data[job.data.arrayCounter].followed_by = user.data.counts.followed_by;
                                checkJobProgress++;
                                console.log('Job in progress - '+checkJobProgress);
                                if(checkJobProgress == data.length){
                                    var object = {"hashtags.$.data":JSON.stringify(data)};
                                    if(userType == "Influencer"){
                                        Influencer.updateBy({instagramId: instagramId,"hashtags._id":tagId}, object, function(err, result) {
                                            console.log("Influencer tag successfully updated");
                                         });
                                    }else{
                                         Advertiser.updateBy({instagramId: instagramId,"hashtags._id":tagId}, object, function(err, result) {
                                            console.log("Advertiser tag successfully updated");
                                         });
                                    }
                                }
                                done();
                            });
                        });
                      }
                    }
                });
          },
          function (err) {
            // All things are done!
          });
        }else{
          //There is some permssion issue with token.Make the advertiser token status invalid in the db
            Advertiser.updateBy({instagramId: instagramId}, {isTokenValid:"no"}, function(err, result) {
                  console.log("Advertiser token Status updated to invalid-"+instagramId);
            });

            //remove the hash tag
            var object = {hashtags:{_id:tagId}};
            Advertiser.removeHashTag({instagramId: instagramId}, object, function(err, result) {
                //recently added tag removed successfuly
            });
        }
      });
};

//function to process users whose token is valid but still do not have any data
exports.processAnalyticsForMissingUser = function(req,res){
    var randomQueue = randomstring.generate();
    var maxMediaLength = 0;
    Advertiser.getDataforAnalytics({"instagramId": { $exists: true },"isTokenValid": "yes","followerDemographics":{$exists: false}}, function(err, result) {

        if (!err) {
            result.forEach(function (advertiser) {
              if(advertiser.instagramId){      
                   var params = { access_token: advertiser.accessToken };
                   var job = queue.create(randomQueue, {
                        params: params
                      , instagramId: advertiser.instagramId
                      , usertype: 'Advertiser'
                    
                    }).removeOnComplete( true ).save( function(err){
                                             //if( !err ) console.log(job.id );
                    });
                   
              }
              
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
     });
    Influencer.getAllInfluencer({"aboutMe": { $exists: true },"isTokenValid": "yes","followerDemographics":{$exists: false}}, function(err, result) {
        if (!err) {
            result.forEach(function (influencer) {
              if(influencer.instagramId){ 
                if(influencer.accesstoken !== undefined){     
                  var params = { access_token: influencer.accesstoken };
                  //code to update the user profile image if it is changed
                  var job = queue.create(randomQueue, {
                      params: params
                    , instagramId: influencer.instagramId
                    , usertype: 'Influencer'
                  
                  }).removeOnComplete( true ).save( function(err){
                                             //if( !err ) console.log(job.id );
                   });
                }
              }
            
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });

    queue.process(randomQueue, function(job, done){
        //email(job.data.to, done);
          //console.log(job.data.usertype);
          var url = 'https://api.instagram.com/v1/users/self/media/recent/';
          var output = [];
          var tmplikeByHour = [];
          var tags =[];
          var bestTimeToPost= [];
          process.nextTick(function() {
            _this.processAnalytics(req,url,job.data.params,0,0,job.data.instagramId,output,tmplikeByHour,tags,job.data.usertype,maxMediaLength,done,bestTimeToPost);
          });
    });
}
//funtion to check if user has valid token or invalid
exports.checkAccessTokenValidity = function(req,res) {
    var randomQueue = randomstring.generate();
    Advertiser.getDataforAnalytics({}, function(err, result) {

        if (!err) {
            result.forEach(function (advertiser) {
              if(advertiser.instagramId){      
                   var params = { access_token: advertiser.accessToken };
                   var job = queue.create(randomQueue, {
                        params: params
                      , instagramId: advertiser.instagramId
                      , usertype: 'Advertiser'
                    
                    }).save( function(err){
                       if( !err ) console.log('Advertiser id'+ job.id );
                    });
                   
              }
              
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
     });

    Influencer.getAllInfluencer({"aboutMe": { $exists: true }}, function(err, result) {
      //console.log(result);
        if (!err) {
            result.forEach(function (influencer) {
              if(influencer.instagramId){ 
                if(influencer.accesstoken !== undefined){     
                  var params = { access_token: influencer.accesstoken };
                  //code to update the user profile image if it is changed
                  var job = queue.create(randomQueue, {
                      params: params
                    , instagramId: influencer.instagramId
                    , usertype: 'Influencer'
                  
                  }).removeOnComplete( true ).save( function(err){
                                             //if( !err ) console.log(job.id );
                   });
                }
              }
            
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
    });
    queue.process(randomQueue, function(job, done){ 
      process.nextTick(function() {
        //console.log(job.id);
         request.get({url:"https://api.instagram.com/v1/users/self/followed-by", qs: job.data.params, json:true,timeout: 15000}, function (e, r, response) {
            //console.log(job.data.usertype);
            if(job.data.usertype == "Influencer"){
                if(response!== undefined && response.meta!== undefined && (response.meta.error_type == "OAuthPermissionsException" || response.meta.error_type == "OAuthAccessTokenException")){
                    var object = {};
                    object.isTokenValid = "no";
                    Influencer.updateBy({instagramId: job.data.instagramId}, object, function(err1, result1) {
                        console.log('Influencer Token status updated to no-'+job.data.instagramId);
                    });
                }
                if(response!== undefined && response.data!== undefined){
                   var object = {};
                    object.isTokenValid = "yes";
                    //code to check if user has some missing image
                    var accessToken=job.data.params;
                    InstagramMedia.get({instagramId: job.data.instagramId}, function(err, medias) {
                      if(medias.length>0){
                        for(var incr=0;incr<medias.length;incr++){
                            
                           //console.log(medias[incr].images.low_resolution);
                           var job = queue.create('checkimages', {
                                  imageUrl: medias[incr].images.thumbnail
                                , instagramId: medias[incr].instagramId
                                , accessToken: accessToken
                                , mediaId: medias[incr].mediaId
                              
                              }).removeOnComplete( true ).save( function(err){
                                         if( !err ) console.log('check image job created');
                              });
                        }
                      }
                    });
                    //code for the missing images ends here
                    Influencer.updateBy({instagramId: job.data.instagramId}, object, function(err1, result1) {
                        console.log('Influencer Token status updated to yes-'+job.data.instagramId);
                    });
                }
            }else{
              if(response!== undefined && response.meta!== undefined && (response.meta.error_type == "OAuthPermissionsException" || response.meta.error_type == "OAuthAccessTokenException")){
                    var object = {};
                    object.isTokenValid = "no";
                    Advertiser.updateBy({instagramId: job.data.instagramId}, object, function(err1, result1) {
                        console.log('Advertiser Token status updated to no-'+job.data.instagramId);
                    });
                }
                console.log(response)
                if(response!== undefined && response.data!== undefined){
                   var object = {};
                    object.isTokenValid = "yes";
                    Advertiser.updateBy({instagramId: job.data.instagramId}, object, function(err1, result1) {
                        console.log('Advertiser Token status updated to yes-'+job.data.instagramId);
                    });
                }
            }
            done();
         });
      });
    });
    
};

//function triggered through the cron job
exports.updateAnalyticsOfAllUsers = function (req, res, next) {
    //code to update analytics of advertisers
    var randomQueue = randomstring.generate();
    //console.log(randomQueue);
    var maxMediaLength = 0;
     Advertiser.getDataforAnalytics({"instagramId": { $exists: true }}, function(err, result) {

        if (!err) {
            result.forEach(function (advertiser) {
              if(advertiser.instagramId){      
                   var params = { access_token: advertiser.accessToken };
                   var job = queue.create(randomQueue, {
                        params: params
                      , instagramId: advertiser.instagramId
                      , usertype: 'Advertiser'
                    
                    }).removeOnComplete( true ).save( function(err){
                                             //if( !err ) console.log(job.id );
                    });
                   
              }
              
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
     });

    //below code is tp update analytics of influencers
     Influencer.getAllInfluencer({"aboutMe": { $exists: true },"isTokenValid": "yes"}, function(err, result) {
        if (!err) {
            result.forEach(function (influencer) {
             
              if(influencer.instagramId){ 
                if(influencer.accesstoken !== undefined){     
                  var params = { access_token: influencer.accesstoken };
                  //code to update the user profile image if it is changed
                  var job = queue.create(randomQueue, {
                      params: params
                    , instagramId: influencer.instagramId
                    , usertype: 'Influencer'
                  
                  }).removeOnComplete( true ).save( function(err){
                                             //if( !err ) console.log(job.id );
                  });
                }
              }
            
            });
        } else {
            return res.send(Boom.badImplementation(err)); // 500 error
        }
        queue.process(randomQueue, function(job, done){
          //email(job.data.to, done);
          //console.log(job.data.usertype);
          var url = 'https://api.instagram.com/v1/users/self/media/recent/';
          var output = [];
          var tmplikeByHour = [];
          var tags =[];
          var bestTimeToPost= [];
          process.nextTick(function() {
            _this.processAnalytics(req,url,job.data.params,0,0,job.data.instagramId,output,tmplikeByHour,tags,job.data.usertype,maxMediaLength,done,bestTimeToPost);
          });
        });
    });  
};

//function to save the advertiser demographic analytics 
exports.advertiserAnalytics = function (req, res, next) {
    if(req.body.InstagramId){
      var object ={};
      object.followerDemographics = JSON.stringify(req.body);
      Advertiser.updateBy({instagramId: req.body.InstagramId}, object, function(err, result) {
          if (!err) {
              return res.json(result);
          } else {
              return res.send(Boom.badImplementation(err)); // 500 error
          }
       });
    }
};

//function to save the influencer analytics 
exports.influencerAnalytics = function (req, res, next) {
    if(req.body.InstagramId){
      var object ={};
      object.followerDemographics = JSON.stringify(req.body);
      Influencer.updateById({instagramId: req.body.InstagramId}, object, function(err, result) {
        console.log(err,result);
          if (!err) {
              return res.json(result);
          } else {
              return res.send(Boom.badImplementation(err)); // 500 error
          }
       });
    }
};

function tagsCount(array_elements) {
    
      var poppularTags = [];
      array_elements.sort();

      var current = null;
      var cnt = 0;
      for (var i = 0; i < array_elements.length; i++) {
          if (array_elements[i] != current) {
              if (cnt > 0) {
                  poppularTags.push({"tagname":current,"count":cnt});
              }
              current = array_elements[i];
              cnt = 1;
          } else {
              cnt++;
          }
      }
      if (cnt > 0) {
          poppularTags.push({"tagname":current,"count":cnt});
      }
      poppularTags.sort(function(a,b) {
        return a.count - b.count;
      });
      return poppularTags;
}

exports.processAnalytics = function(req, url,params, totalLikes,totalComments,instagramId,output,tmplikeByHour,tags,type,maxMediaLength,done,bestTimeToPost){ 
        request.get({url:url, qs: params, json:true,timeout: 7000}, function (e, r, response) {
          
            if (response != undefined && response.meta !== undefined && response.meta.error_type!='OAuthAccessTokenException')
            {
                
                //console.log('Data ',response.data);
                if(response.data !== undefined){
                maxMediaLength = maxMediaLength + response.data.length;
                for (var i = 0; i < response.data.length; i++) {
                  for(var incr = 0; incr < response.data[i].tags.length; incr++){
                    tags.push(response.data[i].tags[incr]);
                  }
                  bestTimeToPost.push({created_time:response.data[i].created_time,likes:response.data[i].likes.count,comments:response.data[i].comments.count})
                  totalLikes = totalLikes + response.data[i].likes.count;
                  totalComments = totalComments + response.data[i].comments.count;
                  var date = new Date(parseInt(response.data[i].created_time)*1000);
                  if(output[date.getHours()] !==undefined){
                    output[date.getHours()] = output[date.getHours()]+1;
                    tmplikeByHour[date.getHours()] = tmplikeByHour[date.getHours()]+response.data[i].likes.count;
                  }else{
                    output[date.getHours()] = 1;
                    tmplikeByHour[date.getHours()] = response.data[i].likes.count;
                  }
                }
              }else{
                if(done!='noCron')
                done();
              }
            }else{
              
              if(done!='noCron'){
                console.log('Access token is invalid')
                done();
              }
              
            }
           
            if(response != undefined && response.pagination !==undefined && response.pagination.next_url && maxMediaLength <=350 ){
                
                var newUrl=response.pagination.next_url;
                _this.processAnalytics(req,newUrl, params,totalLikes,totalComments,instagramId,output,tmplikeByHour,tags,type,maxMediaLength,done,bestTimeToPost);
            }else if(response != undefined && response.meta !== undefined && response.meta.error_type!='OAuthAccessTokenException'){
              //console.log(response);
              console.log('Media Files:- ',maxMediaLength);
              tags = tagsCount(tags);
              var analytics =[];
              var mediaCount = 0;
              for (var i=0; i<=output.length; i++){
                if(output[i]!==null && output[i] !== '' && output[i] !== undefined){
                  analytics.push({"hour":i,"noOfMediaPosted":output[i],"noOfLikes":Math.round(tmplikeByHour[i]),"avgLikes":Math.round(tmplikeByHour[i]/output[i])});
                  mediaCount = mediaCount + output[i];
                }
              }
               tags = tags.reverse();
               tags = tags.slice(0, 30);

               var object = {};
               object.postingAnalytics = JSON.stringify(analytics);
               object.bestTimeToPost = JSON.stringify(bestTimeToPost);
               //console.log(tags);
               object.tags = JSON.stringify(tags);
               //if user type is influencer
               if(type === 'Influencer'){

                    
                    var profileurl = 'https://api.instagram.com/v1/users/'+instagramId;
                    request.get({url:profileurl, qs: params, json:true,timeout: 5000}, function (e, r, user) {

                        if(user !== undefined && user.data !==undefined){
                          
                            object.followed_by = user.data.counts.followed_by;
                            object.profilePhoto = user.data.profile_picture;
                            object.averageLikes =  Math.round(totalLikes/mediaCount);
                            object.averageComments =  Math.round(totalComments/mediaCount);
                            //console.log('Object before save',object);
                            Influencer.updateById({instagramId: instagramId}, object, function(err, result) {
                                  if (!err) {
                                           console.log('analytics updated');
                                       
                                           params = {tok:params.access_token,userid:instagramId,type: type};
                                           if(process.env.NODE_ENV === 'production'){
                                             request.get({url:'https://expaus.in:5003/getFollowerInfo', qs: params, json:true,timeout: 2000}, function (e, r, response) {
                                                console.log('request sent');
                                                if(done!='noCron')
                                                done();
                                             });
                                           }else{
                                              request.get({url:'http://localhost:5003/getFollowerInfo', qs: params, json:true,timeout: 2000}, function (e, r, response) {
                                                console.log('request sent');
                                                if(done!='noCron')
                                                done();
                                             });

                                          }
                                       
                                  } 
                            });
                          
                        }
                    });
                   
               }else{

                  Advertiser.updateBy({instagramId: instagramId}, object, function(err, result) {
                        if (!err) {
                              console.log('analytics updated');
                              
                                 params = {tok:params.access_token,userid:instagramId,type: type};
                                  if(process.env.NODE_ENV === 'production'){
                                     request.get({url:'https://expaus.in:5003/getFollowerInfo', qs: params, json:true,timeout: 2000}, function (e, r, response) {
                                        console.log('request sent');
                                        if(done!='noCron')
                                        done();
                                     });
                                  }else{
                                      request.get({url:'http://localhost:5003/getFollowerInfo', qs: params, json:true,timeout: 2000}, function (e, r, response) {
                                        console.log('request sent');
                                        if(done!='noCron')
                                        done();
                                     });

                                  }
                             
                        } 
                  });
              }


            }
            //done();
        });
  };