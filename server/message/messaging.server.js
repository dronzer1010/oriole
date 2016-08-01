var socketio = require('socket.io'),
	Message = require('./message.server.model').Message,
	emailService = require("../config/emailService"),
	Influencer = require('../influencer/influencer.server.model').Influencer,
	Advertiser = require('../advertiser/advertiser.server.model').Advertiser;

var io;

// maps socket.id to user's id
var nicknames = {};
// list of socket ids
var clients = [];
var namesUsed = [];
exports.listen = function(server) {
	io = socketio.listen(server);

	io.sockets.on('connection', function(socket){
		// console.log('Socket Connected');
		initializeConnection(socket);
		handlePrivateMessaging(socket);
	});

	function initializeConnection(socket) {
		subcribeUser(socket);
		unsubcribeUser(socket);
		sendMessageToSpecipicUser(socket);
		showActiveUsers(socket);
		showOldMsgs(socket);
		showUserChat(socket);
	}

	function subcribeUser(socket){
		socket.on('subscribe', function(room) {
			console.log('joining room', room);
			socket.join(room);
		});
	}

	function unsubcribeUser(socket){
		socket.on('unsubscribe', function(room) {
			console.log('leaving room', room);
			socket.leave(room);
		});
	}

	function sendMessageToSpecipicUser(socket){
		socket.on('sendMessageToUser', function(data) {
			console.log('>>>>>>>>>>>>sending message', data);
			Message.create(data, function(err, result){
				//code to send email to influencer
				if (data.recipientType=='Influencer'){
					Influencer.get({_id: data.recipient}, function(err, result) {

						if(result.notificationSetting.emailFromAdvertiser){

							emailService.messageToInfluencer(result.aboutMe.email,data,function(error, data){
								if(error){
									console.log(error);
								}
								else{
									console.log("mail sent successfully");
								}
							});
						}

					});
				}
				else if(data.recipientType=='Advertiser'){

					Advertiser.get({_id: data.recipient}, function(err, result) {
						if(result !== null)
							if(result.message){

								emailService.messageToInfluencer(result.email,data,function(error, data){
									if(error){
										console.log(error);
									}
									else{
										console.log("mail sent successfully");
									}
								});
							}

					});

				}
				console.log(result);

				io.sockets.in(data.recipient).emit('catchMessageFromUsers', result);
				io.sockets.in(data.sender).emit('catchMessageFromUsers', result);
			});

		});
	}

	function showActiveUsers(socket) {

	}

	function showUserChat(socket){
		socket.on('userChat', function(id){
			var query = {
				$or: [
					{sender: id},
					{recipient: id}
				]
			};
			Message.getLatest(query, function(err, result) {
				if (err) throw err;
				io.sockets.emit('getLatestMessage', result);
			});
		});
	}
	function showOldMsgs(socket) {
		socket.on('allList', function(id){
			console.log("..............id", id);
			var query = {
				$or: [
					{sender: id},
					{recipient: id}
				]
			};
			Message.getAllByQuery(query, function(err, result) {
				console.log("getAllByQuery", err, result.length);
				if (err) throw err;
				io.sockets.emit('allMessageList', result);
			});
		});
	}

	function handlePrivateMessaging(socket) {
		socket.on('message', function(msgObj){
			var newMsg = new Message(msgObj);
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('getmessage', msgObj);
			});
		});
	}
};


