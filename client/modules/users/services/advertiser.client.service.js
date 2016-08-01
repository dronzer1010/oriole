(function() {
    'use strict';
    angular.module('users').factory('advertiser', ['$resource', function($resource) {
        return $resource(':url/:id/:extraId/:page', {}, {
            'update': { method: 'PUT' },
            'save': { method: 'POST' },
            'getArray': { isArray: true },
            'getbyId': { method: 'GET' },
            'delet': { method: 'DELETE' },
            'searchQuery': { method: 'PUT', isArray: true }
        });
    }]);
}());
