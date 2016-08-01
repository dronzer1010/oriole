(function () {
    'use strict';
// Setting up route
angular.module('home').config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');
        // Home state routing
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'modules/home/views/home.client.view.html'
            }).state('advertisersignup', {
                url: '/advertiser/signup',
                templateUrl: 'modules/home/views/home.client.view.html'
            }).state('advertiserlogin', {
                url: '/advertiser/login',
                templateUrl: 'modules/home/views/home.client.view.html'
            });
    }]);
}());