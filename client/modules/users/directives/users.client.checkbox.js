(function () {
'use strict';
angular.module('users').directive('cdTrueValue', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (v) {
                return v?attrs.cdTrueValue:attrs.cdFalseValue;});
            ngModel.$setViewValue(attrs.cdTrueValue);
        }
    };
}]);
}());