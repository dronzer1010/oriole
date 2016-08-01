(function () {
    'use strict';
// Authentication service for user variables
angular.module('users').factory('adminService', ['$resource', function ($resource) {
        return $resource(':url/:id', {}, {
            'getArray': {isArray: true},
            'save': {method: 'POST'},
            'get': {method: 'GET'}
        });
    }]);
}());