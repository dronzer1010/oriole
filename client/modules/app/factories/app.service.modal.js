(function () {
    'use strict';
    var appModule = angular.module('home');
    appModule.service('appModal', ['$modalStack', '$modal', function($modalStack, $modal) {
        
       this.modal = function(templateUrl, controller, size, windowClass) {
                $modalStack.dismissAll();
                var modalInstance = $modal.open({
                    templateUrl: templateUrl,
                    windowClass: windowClass,
                    size: size,
                    controller: controller
                });
            };
        
    }]);
}());