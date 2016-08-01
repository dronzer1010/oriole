// API Server Endpoints
module.exports = function(app, passport){
  require("./user/user.server.routes")(app, passport);
  require("./advertiser/advertiser.server.routes")(app, passport);
  require("./influencer/influencer.server.routes")(app);
  require("./campaign/campaign.server.routes")(app);
  //require("./appliedCampaign/appliedCampaign.server.routes")(app);
  require("./campaignBookmark/campaignBookmark.server.routes")(app);
  require("./influencerBookmark/influencerBookmark.server.routes.js")(app);
  require("./message/message.server.routes.js")(app);
  require("./instagramMedia/instagramMedia.server.routes.js")(app);
  require("./fileManagement/localFile.server.routes.js")(app);
  require("./conversation/conversation.server.routes.js")(app);
  require("./analytics/analytics.server.routes.js")(app);
  require("./reseller/reseller.server.routes.js")(app);
  require("./CTA/CTA.server.routes.js")(app);
};
