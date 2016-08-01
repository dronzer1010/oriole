(function() {
    'use strict';
    // Authentication service for user variables
    angular.module('users').factory('influencer', ['$resource', function($resource) {
        return $resource(':url/:id/:extraId', {}, {
            'update': { method: 'PUT' },
            'save': { method: 'POST' },
            'getArray': { isArray: true },
            'getbyId': { method: 'GET' },
            'delet': { method: 'DELETE' },
            'searchQuery': { method: 'PUT', isArray: true }
        });
    }]);
}());
