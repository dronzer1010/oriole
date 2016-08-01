(function () {
    'use strict';
// Authentication service for user variables
angular.module('home').factory('home', ['$resource', function ($resource) {
        return $resource(':url/:id/:influencer_id', {}, {
            'update': {method: 'PUT'},
            'save': {method: 'POST'},
            'get': {method: 'GET'},
            'getbyId': {method: 'GET'},
            'delet': {method: 'DELETE'},
            'searchQuery': {method: 'PUT', isArray: true}
        });
    }]);
}());