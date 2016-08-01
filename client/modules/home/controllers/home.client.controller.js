(function() {
    'use strict';
    var appModule = angular.module('home');

    appModule.controller('HomeCtrl', ['$scope', 'Authentication', 'home', '$rootScope', '$state', '$translate', '$window','translateGrowl','appModal',
        function($scope, Authentication, home, $rootScope, $state, $translate, $window, translateGrowl, appModal) {
            // This provides Authentication context.
            $scope.toggleLaguage = false;
            $scope.authentication = Authentication;
            $scope.localStorage = localStorage;
            $scope.setLanguageView = function() {
                switch (localStorage.NG_TRANSLATE_LANG_KEY) {
                    case "en":
                        $rootScope.language = "English";
                        break;
                    case "jap":
                        $rootScope.language = "日本語";
                        break;
                    case "kor":
                        $rootScope.language = "Korean";
                        break;
                    case "chin":
                        $rootScope.language = "Chinese";
                        break;
                    default:
                        $rootScope.language = "English";
                        break;
                }
            };
            

            $scope.changeLanguage = function(langKey) {
                $translate.use(langKey);
            };

            $rootScope.$on('$translateChangeSuccess', function(event, data) {
                var language = data.language;
                $rootScope.lang = language;
                $scope.setLanguageView();
            });

            $scope.signup = function() {
                appModal.modal('modules/home/views/signup.html', 'HomeCtrl', 'md', 'xx-dialog');
                return false;
            };
            $scope.login = function() {
                $('body').animate({ scrollTop: 0 }, 'fast'); 
                appModal.modal('modules/home/views/login.html', 'HomeCtrl', 'md', 'xx-dialog');
            };

            $scope.signupAdvertiser = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.signup.html', 'AdvertiserCtrl', 'md', 'modal-scroll');
            };

            $scope.loginAdvertiser = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.login.html', 'AdvertiserCtrl', 'md', 'modal-scroll');
            };
            $scope.load = function() {
                if($state.current.name=="advertisersignup" && $scope.alreadyLoaded== undefined){
                    $scope.signupAdvertiser();
                }else if($state.current.name=="advertiserlogin" && $scope.alreadyLoaded== undefined){
                    $scope.loginAdvertiser();
                }else{
                    home.get({
                        url: 'credential'
                    }).$promise.then(function(data) {
                        if (data.influencer) {
                            $state.go('influencer');
                        } else if (data.advertiser) {
                            $state.go('advertiser');
                        } else if (data.verified) {
                            if (data.verified.message == "already verified") {
                                $scope.alreadyVerifyPop();
                            } else {
                                $scope.verifyPop();
                            }
                            $scope.logout();
                            
                        } else if (data.admin) {
                            $state.go('home');
                        } else if (data.invalidLogin) {
                            $scope.invalidPop();
                            $scope.logout();
                            
                        } else {
                            $scope.logout();
                            
                        }
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }
            };
            $scope.invalidPop = function() {
                appModal.modal('modules/home/views/invalid.client.login.html', 'HomeCtrl', 'md', 'xx-dialog');
            };

            $scope.alreadyVerifyPop = function() {
                appModal.modal('modules/home/views/verify.client.already.html', 'HomeCtrl', 'md', 'xx-dialog');
            };

            $scope.verifyPop = function() {
                appModal.modal('modules/home/views/verify.client.new.html', 'HomeCtrl', 'md', 'xx-dialog');
            };

            $scope.logout = function() {
                home.get({
                    url: 'logout'
                }).$promise.then(function(data) {
                    $state.go('home');
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.sendEmail = function(email, subject, body) {
                var link = "mailto:" + email + "?subject=" + escape(subject) + "&body=" + escape(body);
                window.location.href = link;
            };

            $scope.load();
        }
    ]);
    
    appModule.directive('slideToggle', function() {
        return {
            restrict: 'A',
            scope: {
                isOpen: "=slideToggle"
            },
            link: function(scope, element, attr) {
                var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;

                scope.$watch('isOpen', function(newIsOpenVal, oldIsOpenVal) {
                    if (newIsOpenVal !== oldIsOpenVal) {
                        element.stop().slideToggle(slideDuration);
                    }
                });

            }
        };
    });


    appModule.directive('wrapOwlcarousel', function() {
        return {
            restrict: 'EA',
            link: function(scope, element, attrs) {
                var options = {
                    singleItem: true,
                    autoPlay: false,
                    slideSpeed: 200,
                    navigation: true,
                    navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
                };
                $(element).owlCarousel(options);
            }
        };
    });
}());
