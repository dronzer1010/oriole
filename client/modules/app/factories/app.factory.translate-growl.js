(function () {
    'use strict';
    var appModule = angular.module('home');
    appModule.service('translateGrowl', ['growl', '$translate', function(growl, $translate) {
        
         this.translateGrowlMessage = function(label, msgType) {
                $translate(label).then(function(translatedValue) {

                    if (msgType == 'error') {
                        growl.addErrorMessage(translatedValue);
                    } else if (msgType == 'info') {
                        growl.addInfoMessage(translatedValue);
                    } else {
                        growl.addSuccessMessage(translatedValue);
                    }

                    setTimeout(function() {
                        $('.close').click();
                    }, 3000);
                });
            };
        
    }]);
}());