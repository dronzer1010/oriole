/* jshint validthis: true */
(function () {
    'use strict';
    angular.module('admin').controller('AdminController', ['$scope', 'Authentication', 'adminService', '$rootScope', 'growl', '$state', '$modalStack', '$modal', '$translate', 'translateGrowl', adminController]);

    function adminController(
        $scope, Authentication, adminService,
        $rootScope, growl, $state, $modalStack, $modal, $translate, translateGrowl) {
        var vm =this;
        vm.pendingAdvertiserDetails = function () {
            adminService.getArray({
                url: 'advertiserPending'
            }).$promise.then(function(data) {
                vm.advertisers = data;
                vm.getReseller();
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.saveReseller =function(data ,form){
            if($rootScope.admin =='admin'){
                if (form.$valid) {
                    data.user = "Reseller";
                    adminService.save({
                        url: 'newreseller'
                    }, data).$promise.then(function(response) {
                        if(response!==undefined && response.error){
                            translateGrowl.translateGrowlMessage('There is a  account already existed with this email', 'error');
                        }else{
                            translateGrowl.translateGrowlMessage('Reseller successfully created!!', 'success');
                            $state.go('admin.resellers');
                        }
                        
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }
            }
        };
        vm.getReseller = function () {
            if($rootScope.admin =='admin'){
                adminService.getArray({
                    url: 'resellers'
                }).$promise.then(function(data) {
                    vm.resellerslist = data;
                }).catch(function (error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            }
        };

        vm.removeReseller = function(id){
            var result = confirm("Want to delete?");
            if (result) {
                if($rootScope.admin =='admin'){
                    adminService.get({
                        url: 'resellerRemove',
                        id:id
                    }).$promise.then(function(data) {
                       translateGrowl.translateGrowlMessage('Reseller removed Successfuly', 'success');
                       $state.go($state.current, {}, {reload: true});
                    }).catch(function (error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }
            }
        };
        vm.listadvertiser = function () {
            adminService.getArray({
                url: 'advertiserList'
            }).$promise.then(function(data) {
                vm.advertiserslist = data;
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.listApprovedAdvertiser = function () {
            adminService.getArray({
                url: 'advertiserList',
                status:'approved'
            }).$promise.then(function(data) {
                vm.getReseller();
                vm.advertiserslist = data;
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.getPendingCampaignList = function () {
            adminService.getArray({
                url: 'campaignsPending'
            }).$promise.then(function(data) {
                vm.campaigns = data;
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.adminlogout = function () {
            adminService.save({
                url: 'logoutadmin'
            }, {
                "admin": "true"
            }).$promise.then(function (data) {
                $state.go('login');
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.declineCampaignPopUp = function (item) {
            $modalStack.dismissAll();
            // console.log("declineCampaignPopUp", item);
            vm.item = item;
            vm.modalInstance = $modal.open({
                templateUrl: 'modules/admin/views/admin.decline.campaign.view.html',
                size: 'md',
                scope: $scope,
                controller: 'AdminController',
                resolve: {
                    item: function() {
                        return item;
                    }
                }
            });
        };

        vm.login = function (data, form) {
            if (form.$valid) {
                data.type = 'Admin';
                adminService.save({
                    url: 'adminLogin'
                }, data).$promise.then(function(result) {
                    if (result.status) {
                        vm.loginStatus = result.status;
                        $state.go('login');
                    } else {
                        vm.credentialFun();
                        $state.go('admin.advertiser');

                        vm.pendingAdvertiserDetails();
                    }
                }).catch(function (error) {
                    $state.go('login');
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            } else {
                return false;
            }
        };
        vm.load = function () {
            vm.credentialFun();
        };
        vm.loadPage = function (page) {
            vm.page = page;
            if (page == "advertiserList") {
                $state.go('admin.advertiser');
            } else {
                $state.go('admin.campaigns');
                vm.getPendingCampaignList();
            }
        };
        vm.credentialFun = function () {
            adminService.get({
                url: 'credential'
            }).$promise.then(function(data) {
                $rootScope.admin = null;
                $rootScope.email = null;
                $rootScope.id = null;
                $rootScope.resellerApiKey = null;
                if (data.admin) {
                    $rootScope.admin = "admin";
                    $rootScope.email = data.admin.email;
                    $rootScope.id = data.admin.id;
                }else if(data.reseller){
                    $rootScope.admin = "reseller";
                    $rootScope.email = data.reseller.email;
                    $rootScope.id = data.reseller.id;
                    $rootScope.resellerApiKey = data.reseller.resellerApiKey;
                } else {
                    $state.go('login');
                }
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };

        vm.remove = function(id){
            var result = confirm("Want to delete?");
            if (result) {
                adminService.get({
                url: 'advertiserRemove',
                id:id
                }).$promise.then(function(data) {
                   translateGrowl.translateGrowlMessage('Advertiser removed Successfuly', 'success');
                   $state.go($state.current, {}, {reload: true});
                }).catch(function (error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            }
            
        }
        vm.action = function (item, status) {
            item.status = status;
            adminService.save({
                url: 'changeStatus'
            }, item).$promise.then(function (data) {
                vm.pendingAdvertiserDetails();
                translateGrowl.translateGrowlMessage('ADVERTISER.CHANGE_ADVERTISER_STATUS', 'success');
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.updateReseller = function (item) {
            if(item.resellerId){
                var object ={};
                object.resellerId= item.resellerId;
                object._id= item._id;
                adminService.save({
                    url: 'updateReseller'
                }, item).$promise.then(function (data) {
                    translateGrowl.translateGrowlMessage('Reseller Successfully updated', 'success');
                }).catch(function (error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            }
        };
        vm.updateaction = function (item,subsscriptionLevel) {
            item.userLevel = subsscriptionLevel;
            adminService.save({
                url: 'updateSubscriptionLevel'
            }, item).$promise.then(function (data) {
                vm.listApprovedAdvertiser();
                translateGrowl.translateGrowlMessage('ADVERTISER.CHANGE_ADVERTISER_SUBSCRIPTION_LEVEL', 'success');
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.mulitipleSelected = function (status) {
            var els = angular.element('.regular-checkbox-td:checked');
            Array.prototype.forEach.call(els, function (el) {
                vm.item = _.findWhere(vm.advertisers, {
                    _id: el.id
                });
                vm.action(vm.item, status);
            });
        };

        vm.actionCampaign = function (item, status, form) {
            if (status == 'Declined') {
                if (form.$invalid) {
                    return false;
                }
            }
            item.status = status;
            adminService.save({
                url: 'changeCampaignStatus'
            }, item).$promise.then(function (data) {
                vm.emailUpdate(item.advertiserId, item.status, item.campaignTitle, item.declimeMessage);
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };
        vm.emailUpdate = function (advertiserId, campaignStatus, campaignName, declimeMessage) {
            vm.create = {};
            vm.create.campaignStatus = campaignStatus;
            vm.create.campaignName = campaignName;
            if (declimeMessage) {
                vm.create.declimeMessage = declimeMessage;
            }
            adminService.save({
                url: 'advertiserEmail',
                id: advertiserId
            }, vm.create).$promise.then(function (result) {
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
                $state.go('admin.campaigns', {}, {
                    reload: true
                });
                translateGrowl.translateGrowlMessage('ADVERTISER.CHANGE_CAMPAIGN_STATUS', 'success');
            }).catch(function (error) {
                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
            });
        };

        vm.actionCampaignmultiDecline = function (message, requestform) {
            if (requestform.$valid) {
                if (vm.selectedItems) {
                    var incr;
                    var campaign;
                    for (incr in vm.selectedItems) {
                        campaign = vm.selectedItems[incr];
                        campaign.declimeMessage = message.declimeMessage;
                        //console.log(campaign);
                        vm.actionCampaign(campaign, 'Declined', '');
                    }
                }
            }
        };
        vm.mulitipleCampaignSelected = function (status) {
            var els = angular.element('.regular-checkbox-td:checked');
            vm.selectedItems = [];
            Array.prototype.forEach.call(els, function (el) {
                vm.item = _.findWhere(vm.campaigns, {
                    _id: el.id
                });
                if (status != 'Accept') {
                    vm.selectedItems.push(vm.item);
                } else {
                    vm.actionCampaign(vm.item, status, '');
                }
            });
            if (status == 'Declined') {
                if (vm.selectedItems.length > 0) {
                    vm.declineCampaignPopUpMulti();
                }
            }
        };
        vm.declineCampaignPopUpMulti = function () {
            $modalStack.dismissAll();
            vm.modalInstance = $modal.open({
                templateUrl: 'modules/admin/views/admin.declinemulti.campaign.view.html',
                size: 'md',
                scope: vm,
                controller: 'AdminController'
            });
            return false;
        };
        vm.load();
    }
}());