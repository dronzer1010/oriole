(function () {
'use strict';
angular.module('users').config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('influencer', {url: '/influencer', templateUrl: 'modules/users/views/influencer/common/influencer.html'})
        .state('influencer.profile', {url: '/profile', templateUrl: 'modules/users/views/influencer/editProfile/influencer.profile.html'})
        .state('influencer.profile.aboutMe', {url: '/aboutme', templateUrl: 'modules/users/views/influencer/editProfile/influencer.profile.about-me.html'})
        .state('influencer.profile.photo', {url: '/photo', templateUrl: 'modules/users/views/influencer/editProfile/influencer.profile.photo.html'})
        .state('influencer.profile.terms', {url: '/terms', templateUrl: 'modules/users/views/influencer/editProfile/influencer.profile.terms.html'})
        .state('influencer.profile.payment', {url: '/payment', templateUrl: 'modules/users/views/influencer/editProfile/influencer.profile.payment.html'})
        .state('influencer.profile.langugae', {url: '/language', templateUrl: 'modules/users/views/influencer/editProfile/influencer.profile.langugae.html'})
        .state('influencer.profile.notificationSetting', {url: '/notification', templateUrl: 'modules/users/views/influencer/editProfile/influencer.profile.notification-setting.html'})
        .state('influencer.campaign', {url: '/campaigns', templateUrl: 'modules/users/views/campaign/influencer.campaigns.html'})
        .state('influencer.campaign.details', {url: '/:campaignId', templateUrl: 'modules/users/views/campaign/influencer.campaigns.details.html'})
        .state('influencer.bookmarks', {url: '/bookmarks', templateUrl: 'modules/users/views/campaign/influencer.bookmarks.html'})
        .state('influencer.myCampaign', {url: '/my-campaigns', templateUrl: 'modules/users/views/campaign/influencer.myCampaign.html'})
        .state('influencer.message', {url: '/messages', templateUrl: 'modules/users/views/influencer/message/influencer.client.message.html'})
        .state('influencer.analytics', {url: '/analytics', templateUrl: 'modules/users/views/influencer/analytics/influencer.client.analytics.html'})
        .state('influencer.instagrammers', {url: '/myprofile', templateUrl: 'modules/users/views/influencer/editProfile/influencer.instagrammers.view.html'})
        .state('advertiser', {url: '/advertiser', templateUrl: 'modules/users/views/advertiser/common/index.html'})
        .state('advertiser.analytics', {url: '/analytics', templateUrl: 'modules/users/views/advertiser/analytics/advertiser.analytics.html'})
        .state('advertiser.help', {url: '/help', templateUrl: 'modules/users/views/advertiser/help/advertiser.help.html'})
        .state('advertiser.help.new', {url: '/new', templateUrl: 'modules/users/views/advertiser/help/advertiser.help.new.html'})
        .state('advertiser.analytics.account', {url: '/account', templateUrl: 'modules/users/views/advertiser/analytics/advertiser.analytics.account.html'})
        .state('advertiser.analytics.campaign', {url: '/campaign', templateUrl: 'modules/users/views/advertiser/analytics/advertiser.analytics.campaign.html'})
        .state('advertiser.analytics.details', {url: '/campaigns/tags/:tagname', templateUrl: 'modules/users/views/advertiser/analytics/advertiser.analytics.tagdetail.html'})
        .state('advertiser.home', {url: '/home', templateUrl: 'modules/users/views/advertiser/menuTabs/home/advertiser.common.home.html'})
        .state('advertiser.home.influencer', {url: '/influencer/:influencerId', templateUrl: 'modules/users/views/advertiser/menuTabs/home/advertiser.common.influencer.html'})
        .state('advertiser.campaigns', {url: '/campaigns', templateUrl: 'modules/users/views/advertiser/menuTabs/campaign/advertiser.campaign.home.html'})
        .state('advertiser.campaigns.detailed', {url: '/:campaignId', templateUrl: 'modules/users/views/advertiser/menuTabs/campaign/advertiser.campaign.detailed.html'})
        .state('advertiser.messages', {url: '/messages', templateUrl: 'modules/users/views/advertiser/menuTabs/advertiser.message.html'})
        .state('advertiser.candidate', {url: '/candidates', abstract: true, defaultChild: 'advertiser.candidate.bookmarks', templateUrl: 'modules/users/views/advertiser/menuTabs/candidate/advertiser.candidate.html'})
        .state('advertiser.candidate.bookmarks', {url: '/bookmarks', templateUrl: 'modules/users/views/advertiser/menuTabs/candidate/advertiser.candidate.bookmarks.html'})
        .state('advertiser.candidate.applicants', {url: '/applicants', templateUrl: 'modules/users/views/advertiser/menuTabs/candidate/advertiser.candidate.applicants.html'})
        .state('advertiser.candidate.applicants.campaign', {url: '/:campaignid', templateUrl: 'modules/users/views/advertiser/menuTabs/candidate/advertiser.candidate.applicants.html'})
        .state('advertiser.candidate.hired', {url: '/hired', templateUrl: 'modules/users/views/advertiser/menuTabs/candidate/advertiser.candidate.hired.html'})
        .state('advertiser.settings', {url: '/settings', abstract: true, defaultChild: 'advertiser.settings.profile', templateUrl: 'modules/users/views/advertiser/menuTabs/settings/advertiser.settings.html'})
        .state('advertiser.settings.profile', {url: '/profile', templateUrl: 'modules/users/views/advertiser/menuTabs/settings/advertiser.settings.profile.html'})
        .state('advertiser.settings.notification', {url: '/notification', templateUrl: 'modules/users/views/advertiser/menuTabs/settings/advertiser.settings.notification.html'})
        .state('advertiser.settings.password', {url: '/password', templateUrl: 'modules/users/views/advertiser/menuTabs/settings/advertiser.settings.password.html'})
        .state('advertiser.cta', {url: '/cta', templateUrl: 'modules/users/views/advertiser/CTA/advertiser.CTA.html'})
        .state('advertiser.cta.list', {url: '/list', templateUrl: 'modules/users/views/advertiser/CTA/advertiser.CTA.list.html'})
        .state('advertiser.cta.script', {url: '/script', templateUrl: 'modules/users/views/advertiser/CTA/advertiser.CTA.script.html'})
        .state('advertiser.cta.analytics', {url: '/analytics', templateUrl: 'modules/users/views/advertiser/CTA/advertiser.CTA.analytics.html'})
        .state('advertiser.createCTA', {url: '/create', templateUrl: 'modules/users/views/advertiser/CTA/advertiser.CTA.create.html'});

}]);

    angular.module('users').run(["$rootScope", "$window", '$location', function($rootScope, $window, $location) {

        $rootScope.$on('$routeChangeStart', function(evt, absNewUrl, absOldUrl) {
            $window.scrollTo(0, 0); //scroll to top of page after each route change
        });       
    }]);

}());


    