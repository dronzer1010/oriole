(function () {
'use strict';
angular.module('users').controller('InviteCtrl', ['campaignList', 'influencer', '$scope', function (campaignList, influencer, $scope) {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    //$scope.gPlace;
    $scope.campaignList = campaignList;
    $scope.influencer = influencer;
}]);
}());