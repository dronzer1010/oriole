(function() {
    'use strict';
    // Authentication service for user variables
    angular.module('users').factory('instagramMedia', ['$resource', function($resource) {
        return $resource(':url/:id/', {}, {
            'update': { method: 'PUT' },
            'save': { method: 'POST' },
            'getArray': { isArray: true },
            'get': { method: 'GET' },
            'getbyId': { method: 'GET' },
            'delete': { method: 'DELETE' },
            'searchQuery': { method: 'PUT', isArray: true }
        });
    }]);
}());
