(function () {
'use strict';
angular.module('users').controller('CampaignCtrl', ['pageCampaign', 'campaign', '$scope', '$rootScope', function (pageCampaign, campaign, $scope, $rootScope) {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    //$scope.gPlace;
    $scope.pageCampaign = pageCampaign;
    $scope.campaign = campaign;
    $rootScope.isCampaign = true;
    $scope.search_icon = false;
}]);
}());