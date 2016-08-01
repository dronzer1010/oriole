var Message = require('./message.server.controller');


module.exports = function(app){
	app.post('/message', Message.create);
	app.post('/message/:id', Message.update);
	app.get('/message/:id', Message.getAll);
	app.get('/userMessages/:userId', Message.getAllMessagesRelatedToUser);
	app.get('/latestConversationMessage/:conversationId', Message.getLatestMessageRelatedToConversation);
	app.get('/getByOffset',Message.getByOffset);
};
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	else res.redirect('/home');
}

