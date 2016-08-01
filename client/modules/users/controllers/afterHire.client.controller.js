(function () {
'use strict';
angular.module('users').controller('AfterHireCtrl', ['campaignId', '$scope', function (campaignId, $scope) {
    $scope.campaignId = campaignId;
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    $scope.search_icon = false;
}]);
}());