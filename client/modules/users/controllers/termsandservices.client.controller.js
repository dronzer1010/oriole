(function () {
'use strict';
angular.module('users').controller('TermsAndConditionCtrl', 
	['influencer', '$scope', 'instagramId', 'advertiserId', '$modalInstance', '$modal',
    function(influencer, $scope, instagramId , advertiserId, $modalInstance, $modal) {
    	$('html, body').animate({ scrollTop: 0 }, 'fast');
    	$scope.updateUser = function(){
    		if($scope.confirmed){
	    		/*influencer.save({
		            url: 'test',
		            id: userId}, userId).$promise.then(function(data) {
		                console.log("data", data);
		                $modalInstance.close(true);
		            }).catch(function(error) {
		                console.log("error", error);
		            });*/
				if(advertiserId){
					influencer.save({url: 'updateAdvertiser_', id: advertiserId}, {status: "Verified"})
					.$promise.then(function(data){
					    //$modalStack.dismissAll();
					    //$scope.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_PAYPAL_EMAIL_UPDATED','success');
						$modalInstance.close(true);
					}).catch(function(error){
					    //$scope.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE','error');
					});
				}

				if(instagramId){
					influencer.save({url: 'updateInfluencer', id: instagramId}, {status: "Verified"})
					.$promise.then(function(data){
						$modalInstance.close(true);

					}).catch(function(error){
					    //$scope.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE','error');
					});
				}
	        }
        };


        $scope.termsAndConditionDocPopup = function() {
            var modalInstance = $modal.open({
                templateUrl: 'modules/users/views/shared/termsandservice.doc.dialog.html',
                size: 'md',
                windowClass: 'xx-dialog',
                controller: 'TermsAndConditionCtrl',
                resolve: {
                    instagramId: function() {
                        return null;
                    },
                    advertiserId: function() {
                        return null;
                    }
                }
                    
            });

            modalInstance.result.then(function(){
                //on ok button press 
            },function(){
            });
        };

        $scope.dismissModal  = function(){
        	$modalInstance.close(true);
        };
    }
 ]);
}());