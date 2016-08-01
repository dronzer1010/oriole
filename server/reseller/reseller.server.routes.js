var Reseller = require('./reseller.server.controller');

module.exports = function(app, passport) {
    app.get('/resellers', Reseller.getAll);
    app.post('/newreseller', Reseller.create);
    app.get('/resellerRemove/:id', Reseller.remove);
    app.post('/api/v1/adv/new',Reseller.newAdvertiser);
};
