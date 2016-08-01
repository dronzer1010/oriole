var InstagramMedia  = require('./instagramMedia.server.controller');

module.exports = function(app){
	app.get('/getInstagramMediaByInstagramId/:instagramId', InstagramMedia.getByInstagramId);
	app.get('/getInstagramRecentMediaNotSaved', InstagramMedia.getInstagramRecentMediaNotSaved);
	app.get('/getInstagramMostLikedMediaNotSaved', InstagramMedia.getInstagramMostLikedMediaNotSaved);
	app.post('/instagramMedia', InstagramMedia.create);
	app.post('/instertInstagramMediaList', InstagramMedia.createList);
	app.delete('/instagramMedia/:id', InstagramMedia.remove);
	app.post('/removeInstagramMediaList', InstagramMedia.removeList);	
};