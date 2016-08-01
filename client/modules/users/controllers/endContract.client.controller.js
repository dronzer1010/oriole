(function () {
'use strict';
angular.module('users').controller('EndContractCtrl', ['conversationId', 'price','payMethod', '$scope', function (conversationId, price,payMethod, $scope) {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    $scope.conversationId = conversationId;
    $scope.price = price;
    $scope.payMethod = payMethod;
}]);
}());