/* jshint node: true */
var Paypal = require('paypal-adaptive');
var uuid = require('node-uuid');
var request = require('request');
var querystring = require('querystring');
var config = require('../config/config');
var AppliedCampaign = require('../appliedCampaign/appliedCampaign.server.model').AppliedCampaign;
var paypalSdk = new Paypal(config.paypalConfig);
var Conversation = require('../conversation/conversation.server.model').Conversation;
var Message = require('../message/message.server.model').Message;
var Influencer = require('../influencer/influencer.server.model').Influencer;
var order_id = uuid.v4();
var reqUrl = '';
//http://code.runnable.com/UtkFzblr0N9YAABV/paypal-ipn-listner-for-node-js-and-webserver
exports.paypalPayment = function(req, res,paypalEmail) {
        if(req.body.userLevel == "Standard"){
            var infPayAmount=req.body.price/1.30;
            var feePayer = "PRIMARYRECEIVER";
        }else{
            var infPayAmount=req.body.price;
            var feePayer = "SECONDARYONLY";
        }
        console.log(infPayAmount);
        var payload = {
            requestEnvelope: {
                errorLanguage:  'en_US'
            },
            actionType:     'PAY_PRIMARY',
            currencyCode:   'USD',
            feesPayer:      feePayer,
            memo:           'Expaus Payment',
            cancelUrl:      config.url.basePath + "/?order_id=" + order_id,
            ipnNotificationUrl: "https://expaus.in/orderExecuteIpn/?order_id=" + order_id + '&campaignId=' +req.body.campaignId + '&influencerId=' +req.body.influencerId + '&advertiserId=' +req.body.advertiserId + '&price=' +req.body.price +'&message='+req.body.message,
            returnUrl:      config.url.basePath + req.session.currenturl,
            receiverList: {
                receiver: [
                    {
                        email:  'hirumakenta-facilitator@outlook.jp',
                        amount: req.body.price,
                        primary:'true'
                    },
                    {
                        email:  'hirumakenta-buyer@outlook.jp',//paypalEmail
                        amount: (infPayAmount),
                        primary:'false'
                    }
                ]
            }
        };

        //console.log("ipnNotificationUrl", payload.ipnNotificationUrl);
        
       paypalSdk.pay(payload, function (err, response) {
        if (err) {
            console.log(response);
        } else {
            req.session.hired = req.body.status;
            req.session.message = req.body.message;
            console.log(response.paymentApprovalUrl);
            return res.json({
                'url': response.paymentApprovalUrl
            });
        }
        });
};

exports.orderExecuteIpn = function(req, res) {
        if(req.body.status == 'INCOMPLETE'){
                
                var object = {};
                var url = req.body.ipn_notification_url;
                console.log(url);
                if(url){
                var   data = url.split('&');
                    object.campaignId = data[1].split('campaignId=')[1];
                    object.influencerId = data[2].split('influencerId=')[1];
                    object.advertiserId = data[3].split('advertiserId=')[1];
                    object.price = data[4].split('price=')[1];
                    object.status = 'hired';
                    object.pay_key = req.body.pay_key;

                    Influencer.get({'_id':object.influencerId}, function(err, result){
                        console.log(">>>>find influencer", err, result.paypalSetting);
                        if(result.paypalSetting && !result.paypalSetting.paypalEmail){
                            Influencer.updateById({'_id':object.influencerId}, {paypalSetting: {emailRequested: true}},
                            function(err, result){
                                console.log('update influencer', err, result);
                            });
                        }
                    });

                    var message = {
                            recipient: object.influencerId,
                            sender: object.advertiserId,
                            message: data[5].split('message=')[1],
                            type : 'normal'
                        };
                    
                    Conversation.findOne({ $and: [ { 'campaignId': object.campaignId}, { 'influencerId': object.influencerId},{ 'advertiserId': object.advertiserId}] } , function(err, result){
                        console.log("<><><><>", result);
                        if(result){ 
                           console.log(">>>>>>>>>>>>>>>>update");
                            if(result.status !=='hired' && result.status !=='completed'){
                                Conversation.update({'_id': result._id},object, function(err, updateResult) {
                                    if (!err) {
                                        message.conversation = result._id;
                                        console.log(">>>>>>>>>>>>>>>>update", message);
                                        Message.create(message,function(err, result){
                                            console.log('createMessage', err, result);
                                        });
                                        console.log('record updated');
                                    }else{console.log(err);}
                               
                                });
                            }
                        }else{
                            console.log(">>>>>>>>>>>>>>>>create conversation", object);
                            object.message = data[5].split('message=')[1];
                            Conversation.create(object, function(err, result) {
                                if (!err) {
                                    message.conversation = result._id;
                                    console.log(">>>>>>>>>>>>>>>>create", message);
                                    Message.create(message,function(err, result){
                                        console.log('createMessage', err, result);
                                    });
                                    console.log('record created', result);
                                }else{console.log(err);}
                            });
                        }
                    });

                   
                }
        }

        //vaidate the ipn
        var postreq = 'cmd=_notify-validate';
        for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                var value = querystring.escape(req.body[key]);
                postreq = postreq + "&" + key + "=" + value;
            }
        }
        var options = {
            url: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
            method: 'POST',
            headers: {
                'Connection': 'close'
            },
            body: postreq,
            strictSSL: true,
            rejectUnauthorized: false,
            requestCert: true,
            agent: false
        };
        request(options, function callback(error, response, body) {
          if (!error && response.statusCode === 200) {
            if (body.substring(0, 8) === 'VERIFIED'){
                //console.log(req.body);
                    
                // assign posted variables to local variables
            } else if (body.substring(0, 7) === 'INVALID') {
                // IPN invalid, log for manual investigation
                console.log('Invalid IPN!');
            }
          }
        });
       
};

exports.processPayment = function(req, res, paykey,callback) {
        var payload = {
            requestEnvelope: {
                errorLanguage:  'en_US'
            },
            payKey:     paykey,
        };

        paypalSdk.executePayment(payload, function (err, response) {
            if (err) {
                console.log(err);
            } else {
              if (response.paymentExecStatus == 'COMPLETED'){
                callback(err, response);
              }
            }
        });
};
