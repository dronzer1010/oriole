(function () {
'use strict';
angular.module('users').controller('HireCtrl', ['campaignList', 'influencer', 'conversationId', 'userLevel', 'serviceFeesmultiplier', 'campaignId', '$scope', function (campaignList, influencer,
        conversationId, userLevel, serviceFeesmultiplier, campaignId, $scope) {
	$('html, body').animate({ scrollTop: 0 }, 'fast');
    //$scope.gPlace;
    $scope.campaignList = campaignList;
    $scope.influencer = influencer;
    $scope.conversationId = conversationId;
    $scope.campaignId = campaignId;
    $scope.userLevel = userLevel;
    $scope.serviceFeesmultiplier = serviceFeesmultiplier;
}]);
}());