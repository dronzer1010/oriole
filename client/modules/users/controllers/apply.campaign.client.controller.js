(function () {
'use strict';
angular.module('users').controller('ApplyCampaignCtrl', ['campaignData', 'campaignId', 'influencer', '$scope',
    function (campaignData, campaignId, influencer, $scope) {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    //$scope.gPlace;
    $scope.campaignData = campaignData;
    $scope.campaignId = campaignId;
    $scope.influencer = influencer;
    $scope.checkBookmarkedCampaign = function () {
        angular.forEach($scope.campaignData, function (data) {

            if (data._id == $scope.campaignId) {
                $scope.singleCampaign = data;
            }
        });
    };
    $scope.checkBookmarkedCampaign();
    $scope.search_icon = false;
}]);
}());