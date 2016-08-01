(function () {
'use strict';
angular.module('users').controller('RequestCtrl', ['conversationId', 'campaignId', 'recipient', 'index', '$scope', function (conversationId, campaignId, recipient, index, $scope) {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    $scope.conversationId = conversationId;
    $scope.campaignId = campaignId;
    $scope.recipient = recipient;
    $scope.index = index;
}]);
}());