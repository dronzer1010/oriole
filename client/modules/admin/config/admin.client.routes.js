(function () {
    'use strict';
    // Setting up route
    angular.module('admin').config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
            // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');
            // Home state routing
        $stateProvider
            .state('login', {
                url: '/admin',
                templateUrl: 'modules/admin/views/login.client.view.html'
            })
            .state('admin', {
                url: '/admin/users',
                templateUrl: 'modules/admin/views/admin.client.view.html'
            })
            .state('admin.advertiser', {
                url: '/advertiser',
                templateUrl: 'modules/admin/views/admin.client.advertiser.html'
            })
            .state('admin.updateadvertiserssubscription', {
                url: '/updateadvertiserssubscription',
                templateUrl: 'modules/admin/views/admin.client.advertisers.list.html'
            })
            .state('admin.campaigns', {
                url: '/campaigns',
                templateUrl: 'modules/admin/views/admin.client.campaigns.html'
            })
            .state('admin.resellers', {
                url: '/resellers',
                templateUrl: 'modules/admin/views/admin.reseller.list.html'
            })
            .state('admin.resellers.new', {
                url: '/new',
                templateUrl: 'modules/admin/views/admin.reseller.new.html'
            })
            .state('logout', {
                url: '/admin',
                templateUrl: 'modules/admin/views/login.client.view.html'
            });
    }]);
}());