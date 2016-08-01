(function() {
    'use strict';
    angular.module('users').controller('AdvertiserCtrl', ['$location', '$http', 'Authentication', '$modalStack',
        '$modal', 'advertiser', '$rootScope', '$state', '$scope',
        'categoryService', 'Upload', 'instagramMedia', '$translate', '$window', 'ENV', 'translateGrowl', 'appModal', 'dateselector','$auth',
        function($location, $http, Authentication, $modalStack, $modal, advertiser, $rootScope, $state, $scope,
            categoryService, Upload, instagramMedia, $translate, $window, ENV, translateGrowl, appModal, dateselector,$auth) {
            $('html, body').animate({ scrollTop: 0 }, 'fast');
            $scope.glued = true;
            $rootScope.$state = $state;
            $rootScope.env = ENV;
            $scope.searchCollapsed = true;
            $scope.advertiserIdCTA = $rootScope._id;
            $scope.ad_settings = [
                { value: 0, name: 'SETTINGS.PROFILE_TITLE' },
                { value: 1, name: 'SETTINGS.PASSWORD_TITLE' },
                { value: 2, name: 'SETTINGS.NOTIFICATION_TITLE' }
            ];


            $scope.ad_analytics = [
                { value: 0, name: 'ANALYTICS.ACCOUNT' },
                { value: 1, name: 'ANALYTICS.CAMPAIGN' }
            ];
            if ($window.sessionStorage.getItem('currentSetting')) {
                $scope.toggle = parseInt($window.sessionStorage.getItem('currentSetting'));
            } else {
                $scope.toggle = 0;
            }

            $scope.generateHubTiles = function(hub,items){
                if(hub.framefirstMultiplier!=undefined && hub.framesecondMultiplier!=undefined){

                    var totalItems=hub.framefirstMultiplier*hub.framesecondMultiplier; 
                    $scope.items=[];
                    for(var incr=0;incr<totalItems;incr++){
                        $scope.items.push({title:'',url:'',color:''});
                    }
                }
            };

            $scope.saveHubInfo = function(form,hub,items){
                if(form.$valid){
                    hub.advertiserId = $rootScope._id;
                    hub.tiles=items;
                    advertiser.save({
                    url: 'newHub'
                    }, hub).$promise.then(function(data) {
                        translateGrowl.translateGrowlMessage('Hub page saved successfully!!', 'success');
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }
            };

            $scope.authenticate = function(provider) {
                $scope.blinkAnalytics  = true;
                $auth.authenticate(provider).then(function(response) {
                       //console.log(response);
                       if(response.data !== undefined){
                         $("#logindialog").hide();

                         $scope.advertiserGet($scope.advertiserInfo.email);

                         setInterval(function() {
                             if($scope.blinkAnalytics){
                                 $scope.advertiserGet($scope.advertiserInfo.email);
                             }else{
                                $("#processing").hide();
                             }
                         }, 20000);

                       }
                });
             };

            //remove the  tag
            $scope.removeTag = function(tagId){
                if(tagId){
                    var object = {hashtags:{_id:tagId}};
                    advertiser.save({
                        url: 'removeHashTag',
                        id: $rootScope.email
                    }, object).$promise.then(function(response) {
                        translateGrowl.translateGrowlMessage('ANALYTICS.TAG_REMOVED_MESSAGE', 'success');
                        $scope.advertiserGet($rootScope.email);
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }
            };
            $scope.saveTag = function(data, add_tag_form){
                if(add_tag_form.$valid){
                    var object = {hashtags:{name:data.name}};
                    advertiser.save({
                        url: 'updateHashTags',
                        id: $rootScope.email
                    }, object).$promise.then(function(response) {
                        //console.log(response.max_tag_limit);
                        if(response!=undefined && response.max_tag_limit!=undefined){
                            $scope.max_tag_limit= response.max_tag_limit;
                        }else{
                            $scope.advertiserGet($rootScope.email);
                            $modalStack.dismissAll();
                            translateGrowl.translateGrowlMessage('ANALYTICS.TAG_ADDED_MESSAGE', 'success');
                            $state.go($state.current, {}, {reload: true});
                        }

                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }
            };
            //code to display new tag form
            $scope.addNewTagForm = function(){
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/analytics/advertiser.tag.add.html',
                    size: 'md',
                    windowClass: 'xx-dialog',
                    controller: 'AdvertiserCtrl'
                });
            };
            $scope.applyAdvertiserFilter =function(searchCriteria){
                var newDate = new Date();
                $scope.filterObject = {};
                if(searchCriteria.male){
                    $scope.filterObject.male = searchCriteria.male;
                }else{
                    $scope.filterObject.male = undefined;
                }

                if(searchCriteria.female){
                    $scope.filterObject.female = searchCriteria.female;
                }else{
                    $scope.filterObject.female = undefined;
                }
                $scope.filterObject.minAge = new Date(newDate.setFullYear(newDate.getFullYear(),newDate.getMonth(),newDate.getDate()));
                var newDateEnd = new Date();
                $scope.filterObject.maxAge = new Date(newDateEnd.setFullYear(newDateEnd.getFullYear()-50,newDateEnd.getMonth(),newDateEnd.getDate()));
                $scope.filterObject.maxAgePlus = 50;
                $scope.filterObject.minFollower = 10000;
                $scope.filterObject.maxFollower = 500000;
                $scope.filterObject.minPrice = 100;
                $scope.filterObject.maxPrice = 1000;
                $scope.filterObject.campaignCategory = undefined;
                $scope.filterObject.chosenPlace = undefined;
                if(searchCriteria.age !=undefined){

                    var newDate = new Date();
                    if(searchCriteria.age[0] === "18"){
                        searchCriteria.age[0] =0;
                    }
                    $scope.filterObject.minAge = new Date(newDate.setFullYear(newDate.getFullYear()-searchCriteria.age[0],newDate.getMonth(),newDate.getDate()));
                    var newDateEnd = new Date();
                    $scope.filterObject.maxAge = new Date(newDateEnd.setFullYear(newDateEnd.getFullYear()-searchCriteria.age[1],newDateEnd.getMonth(),newDateEnd.getDate()));
                    $scope.filterObject.maxAgePlus = searchCriteria.age[1];

                }
                if(searchCriteria.followers !=undefined){
                    $scope.filterObject.minFollower = searchCriteria.followers[0];
                    $scope.filterObject.maxFollower = searchCriteria.followers[1];
                }
                if(searchCriteria.price !=undefined){
                    $scope.filterObject.minPrice = searchCriteria.price[0];
                    $scope.filterObject.maxPrice = searchCriteria.price[1];
                }

                if(searchCriteria.campaignCategory !=undefined){
                    switch (searchCriteria.campaignCategory) {
                        case "HOMEPAGE.COSMETIC":
                             $scope.filterObject.campaignCategory  = "Cosmetic";
                            break;
                        case "HOMEPAGE.FASHION":
                            $scope.filterObject.campaignCategory = "Fashion";
                            break;
                        case "HOMEPAGE.FOOD":
                            $scope.filterObject.campaignCategory = "Food";
                            break;
                        case "HOMEPAGE.SPORTS":
                            $scope.filterObject.campaignCategory = "Sports";
                            break;
                        case "HOMEPAGE.JEWELLARY":
                            $scope.filterObject.campaignCategory = "Jewellary";
                            break;
                        case "HOMEPAGE.HEALTH":
                            $scope.filterObject.campaignCategory = "Health";
                            break;
                        case "HOMEPAGE.TRAVEL":
                            $scope.filterObject.campaignCategory = "Travel";
                            break;
                        case "HOMEPAGE.MUSIC":
                            $scope.filterObject.campaignCategory = "Music";
                            break;
                        default:
                            break;
                    }
                }
                if(searchCriteria.chosenPlace !=undefined){
                    $scope.filterObject.chosenPlace = searchCriteria.chosenPlace;
                }
                $scope.pageNumber = $scope.pageNumber?$scope.pageNumber:1
                $scope.getInfluencerList($scope.pageNumber);
            };
            $scope.goAnalytics = function(toggle){
                $window.sessionStorage.setItem('currentSetting', toggle);
                switch (toggle) {
                    case 0:
                        $state.go('advertiser.analytics.account');
                        break;

                    case 1:
                        $state.go('advertiser.analytics.campaign');
                        break;

                }
            };
            $scope.goSetting = function(toggle) {
                $window.sessionStorage.setItem('currentSetting', toggle);
                switch (toggle) {
                    case 0:
                        $state.go('advertiser.settings.profile');
                        break;

                    case 1:
                        $state.go('advertiser.settings.password');
                        break;

                    case 2:
                        $state.go('advertiser.settings.notification');
                        break;
                }
            };

            // candiates
            $scope.ad_candiates = [
                { value: 0, name: 'INFLUENCER_COMMON_HEADER.LIST_3' },
                { value: 1, name: 'ADVERTISER_CAMPAIGNS.APPLICANT' },
                { value: 2, name: 'ADVERTISER_CANDIDATE.HIRED' },
                { value: 3, name: 'AD_MESSAGE_PAGE.BTN_1' }
            ]
            if ($window.sessionStorage.getItem('currentCandiate')) {
                $scope.toggle = parseInt($window.sessionStorage.getItem('currentCandiate'));
            } else {
                $scope.toggle = 0
            }

            $scope.goCandiate = function(toggle) {
                    $window.sessionStorage.setItem('currentCandiate', toggle);
                    switch (toggle) {
                        case 0:
                            $state.go('advertiser.candidate.bookmarks');
                            break;

                        case 1:
                            $state.go('advertiser.candidate.applicants');
                            break;

                        case 2:
                            $state.go('advertiser.candidate.hired');
                            break;

                        case 3:
                            $scope.createCampaignPopUp();
                            break;
                    }
                }
                // check home page
            if ($window.sessionStorage.getItem('isHome') === false) {
                $rootScope.search_icon = false;
            }

            $scope.days = dateselector.days();
            $scope.months = dateselector.months();
            $scope.years = dateselector.dueYear();

            $scope.collapseSearch = function() {
                $scope.searchCollapsed = !$scope.searchCollapsed;
                $scope.navCollapsed = true;
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
            };
            //collapse the navigation in the responsive view
            $scope.navCollapsed = true;
            $scope.collapseNav = function() {
                $scope.navCollapsed = !$scope.navCollapsed;
                $scope.searchCollapsed = true;
                $scope.flag = true;
            };
            $scope.hideToggle = function() {
                if ($scope.flag == false) {
                    if ($scope.navCollapsed == false) {
                        $scope.navCollapsed = true;
                    }
                }
                $scope.flag = false;
            }

            $scope.isActive1 = function(item) {
                if (sessionStorage.selectedConversationId == item._id) {
                    $scope.selectedConversation = item;
                    return true;
                }
                return false;
            };

            //modal for company sign up
            $scope.signupAdvertiser = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.signup.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            //modal for company login

            $scope.loginAdvertiser = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.login.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.register = function(data, form) {
                if (form.$valid) {
                    data.status = "Pending";
                    data.user = "Advertiser";
                    advertiser.get({
                        url: 'advertiser',
                        id: data.email
                    }).$promise.then(function(result) {
                        if (result.exist !== false) {
                            $scope.regExist = true;
                        } else {
                            advertiser.save({
                                url: 'advertiser'
                            }, data).$promise.then(function(response) {
                                $scope.profileDetails = {};
                                $scope.regCompleted = true;
                            }).catch(function(error) {
                                translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                            });
                        }
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                } else {
                    return false;
                }
            };


            $scope.login = function(data, form) {
                if (form.$valid) {
                    data.type = 'Advertiser';
                    advertiser.save({
                        url: 'advertiserStatus'
                    }, data).$promise.then(function(result) {
                        if (result.status == "Not Exist" || result.status == "Pending" || result.status == "Declined" || result.status == "Invalid Username and Password" || result.status == "Verify your email") {
                            $scope.showLogin = false;
                            $rootScope.loginStatus = result.status;

                            setTimeout(function() { delete $rootScope.loginStatus; }, 3000);
                            $scope.credentialFunc();
                        } else {
                            $scope.credentialFunc();
                            $modalStack.dismissAll();
                        }
                    }).catch(function(error) {

                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                } else {
                    return false;
                }
            };
            
            $scope.getHubPageHeading =function(){
                $scope.pageHeading ="Create Hub Page";
            };
            $scope.hideCreateHelpPageTitle =function(){
                $scope.pageHeading ="";
            };
            $scope.credentialFunc = function() {
                $scope.showLoginAnalytics = false;
                advertiser.get({
                    url: 'credential'
                }).$promise.then(function(data) {
                    if (data.hire) {
                        $scope.afterhirePopUp(data.hire.campaignId);
                        advertiser.get({
                            url: 'expireHireSession'
                        }).$promise.then(function(data1) {}).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                    }
                    if (data.endContarct) {
                        $scope.endContarctSuccessPopUp();
                        advertiser.get({
                            url: 'expireHireSession'
                        }).$promise.then(function(data1) {}).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                    }
                    if (data.advertiser) {
                        
                        $rootScope._id = data.advertiser.id;
                        $rootScope.email = data.advertiser.email;
                        $rootScope.instagramId = data.advertiser.instagramId;
                        $scope.getAllApprovedCampaign();
                        $scope.advertiserGet($rootScope.email);
                        localStorage.setItem('advertiserId' ,$rootScope._id);
                        if ($state.current.name === 'advertiser.campaigns') {
                            $scope.showPage('campaignPage');
                        }else if($state.current.name === 'advertiser.cta'){
                            $scope.showPage('cta');
                        }else if($state.current.name === 'advertiser.cta.list'){
                            $scope.showPage('cta' , 'list');
                        }else if($state.current.name === 'advertiser.cta.analytics'){
                            $scope.showPage('cta' , 'analytics');
                        }else if($state.current.name === 'advertiser.cta.script'){
                            $scope.showPage('cta' , 'script');
                        }else if($state.current.name === 'advertiser.createCTA'){
                            $state.go('advertiser.createCTA');
                        }else if ($state.current.name === 'advertiser.messages') {
                            $scope.showPage('messagePage');
                        }else if ($state.current.name === 'advertiser.analytics') {
                            $scope.advertiserGet($rootScope.email);
                            $state.go('advertiser.analytics');
                        } else if ($state.current.name === 'advertiser.candidate.bookmarks') {
                            $scope.showPage('candidatePage', 'bookmarks');
                        } else if ($state.current.name === 'advertiser.candidate.applicants') {
                            $scope.showPage('candidatePage', 'applicants');
                        } else if ($state.current.name === 'advertiser.candidate.hired') {
                            $scope.showPage('candidatePage', 'hired');
                        } else if ($state.current.name === 'advertiser.settings.profile') {
                            $scope.showPage('settingsPage', 'profile');
                        } else if ($state.current.name === 'advertiser.settings.password') {
                            $scope.showPage('settingsPage', 'password');
                        } else if ($state.current.name === 'advertiser.settings.notification') {
                            $scope.showPage('settingsPage', 'notification');
                        } else if ($state.current.name === 'advertiser.analytics.account') {
                            $scope.showPage('analyticsPage', 'account');
                        } else if ($state.current.name === 'advertiser.analytics.campaign') {
                            $scope.showPage('analyticsPage', 'campaign');
                        }else if ($state.current.name === 'advertiser.help.new') {
                            $scope.getHubPageHeading();
                            $state.go("advertiser.help.new")
                        }else if ($state.current.name === 'advertiser.help') {
                            $scope.pageHeading ='';
                            $state.go("advertiser.help")

                        } else {
                            if ($state.current.name != 'advertiser.home.influencer' && $state.current.name != 'advertiser.campaigns.detailed') {
                                $state.go('advertiser.home');
                                //$scope.pageNumber = 1;
                                //$scope.getInfluencerList($scope.pageNumber);
                            }
                            $scope.subcribleUserToMessageSender_($rootScope._id);
                            $scope.catchMessagesFromSender_();
                        }
                    } else {
                        $scope.logout();
                        $state.go('home');
                    }
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.logout = function() {
                advertiser.get({
                    url: 'logout'
                }).$promise.then(function(data) {
                    $state.go('home');
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            function abbrNum(number, decPlaces) {
                // 2 decimal places => 100, 3 => 1000, etc
                decPlaces = Math.pow(10,decPlaces);

                // Enumerate number abbreviations
                var abbrev = [ "k", "m", "b", "t" ];

                // Go through the array backwards, so we do the largest first
                for (var i=abbrev.length-1; i>=0; i--) {

                    // Convert array index to "1000", "1000000", etc
                    var size = Math.pow(10,(i+1)*3);

                    // If the number is bigger or equal do the abbreviation
                    if(size <= number) {
                         // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                         // This gives us nice rounding to a particular decimal place.
                         number = Math.round(number*decPlaces/size)/decPlaces;

                         // Add the letter for the abbreviation
                         number += abbrev[i];

                         // We are done... stop
                         break;
                    }
                }

                return number;
            }

            $scope.bestTimeOfPostByTimezone =function(postingData,timezone){
                var data ={};
                data.bestTimeToPost =postingData;
                data.preferredTimezone = timezone;
                if(data.bestTimeToPost !== undefined){
                        var bestTimeToPost =[];
                        var highestLikes = 0;
                        var totalPostByWeekAndHour = [];
                        var tmpLikesByWeekAndHour;
                        angular.forEach(jQuery.parseJSON(data.bestTimeToPost), function(item) {
                            //get the user timezone

                            if(data.preferredTimezone){
                                    var date = new Date(parseInt(item.created_time)*1000);
                                    var hour = moment(date).tz(data.preferredTimezone).format("H");
                                    var dayName = moment(date).tz(data.preferredTimezone).format("ddd");
                            }else{
                                var date = new Date(parseInt(item.created_time)*1000);
                                var hour = date.getHours();
                                var dayName = moment(date).format("ddd");

                            }
                            if(bestTimeToPost[dayName] !==undefined){
                               if(bestTimeToPost[dayName][hour] !==undefined){
                                    bestTimeToPost[dayName][hour]= bestTimeToPost[dayName][hour]+item.likes;
                                    totalPostByWeekAndHour[dayName][hour]= totalPostByWeekAndHour[dayName][hour]+1;
                               }else{
                                    bestTimeToPost[dayName][hour]= item.likes;
                                    totalPostByWeekAndHour[dayName][hour] = 1;
                               }
                            }else{
                                bestTimeToPost[dayName] =[];
                                totalPostByWeekAndHour[dayName] =[];
                                bestTimeToPost[dayName][hour]= item.likes;
                                totalPostByWeekAndHour[dayName][hour] = 1;
                           }
                        });

                        //fommat the array and heat map
                        var weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

                        //code to calculate average highest likes
                        for(var week_days=0; week_days<weekdays.length;week_days++){
                            for(var i=0; i<=23; i++){
                                    if(bestTimeToPost[weekdays[week_days]]!=undefined){
                                        if(bestTimeToPost[weekdays[week_days]][i]!=undefined){
                                            tmpLikesByWeekAndHour = Math.round(bestTimeToPost[weekdays[week_days]][i]/totalPostByWeekAndHour[weekdays[week_days]][i]);
                                            if(highestLikes<tmpLikesByWeekAndHour){
                                                highestLikes = tmpLikesByWeekAndHour;
                                            }
                                        }
                                    }
                            }
                        }

                        $scope.bestTimeToPost = [];
                        if(highestLikes){
                            var rangeMultiplier = Math.round(highestLikes/5);
                            for(var week_days=0; week_days<weekdays.length;week_days++){

                                for(var i=0; i<=23; i++){
                                    if(bestTimeToPost[weekdays[week_days]]!=undefined){
                                        if(bestTimeToPost[weekdays[week_days]][i]==undefined){
                                            bestTimeToPost[weekdays[week_days]][i]='0-#f9f9f9';
                                        }else{
                                            var tmpLikesByWeekAndHour = Math.round(bestTimeToPost[weekdays[week_days]][i]/totalPostByWeekAndHour[weekdays[week_days]][i]);
                                            var likeValue = tmpLikesByWeekAndHour;
                                            var colorCode;

                                            if(likeValue<=rangeMultiplier){
                                                colorCode = "-#fdd86b";
                                            }else if(likeValue<=(rangeMultiplier*2) && likeValue > rangeMultiplier){
                                                colorCode = "-#fcc965";
                                            }else if(likeValue<=(rangeMultiplier*3) && likeValue > (rangeMultiplier*2)){
                                                colorCode = "-#fcb85e";
                                            }else if(likeValue<=(rangeMultiplier*4) && likeValue > (rangeMultiplier*3)){
                                                colorCode = "-#fca458";
                                            }else if(likeValue<=(rangeMultiplier*5) && likeValue > (rangeMultiplier*4)){
                                                //console.log(likeValue);
                                                colorCode = "-#f97c47";
                                            }

                                             bestTimeToPost[weekdays[week_days]][i] = abbrNum(tmpLikesByWeekAndHour,2)+colorCode;
                                        }
                                    }else{
                                        bestTimeToPost[weekdays[week_days]] =[];
                                        bestTimeToPost[weekdays[week_days]][i]='0-#f9f9f9';
                                    }
                                }
                                $scope.bestTimeToPost.push({dayname:weekdays[week_days],list:bestTimeToPost[weekdays[week_days]]});
                            }


                        }
                }
            };

            $scope.advertiserInfo = {};
            $scope.calculateHashTags = function(){
                $scope.dateListing= null;
                $scope.postsByDate= null;
                $scope.likesByDate= null;
                $scope.totalReach =0;
                $scope.totalLikes =0;
                $scope.totalComments =0;
                $scope.totalPosts =0;
                $scope.firstPostedDate = null;
                $scope.lastPostedDate = null;
                $scope.topSixPhotos =null;
                $("#loadingdev").show();
                advertiser.get({
                    url: 'advertiserById',
                    id: $rootScope.email
                }).$promise.then(function(data) {
                
                if(data.campaignCount){
                        $rootScope.campaignCount = data.campaignCount;
                }
                var data = data.result;
                if(data.hashtags) {

                        if($state.params.tagname){
                            $scope.tagname = $state.params.tagname;
                            angular.forEach((data.hashtags), function(item) {

                                if(item.name==$state.params.tagname){
                                    $scope.hashtags = item;
                                }
                            });
                            console.log($scope.hashtags);
                            var hashtagSortedList = [];
                            var topSixPhotos = [];
                            var parsedData= JSON.parse($scope.hashtags.data);
                            angular.forEach(parsedData, function(item) {
                                   if(data.preferredTimezone){
                                        var date = new Date(parseInt(item.created_time)*1000);
                                        var convertedDate = moment(date).tz(data.preferredTimezone).format("YYYY-MM-DD");
                                        item.created_time=convertedDate;
                                        hashtagSortedList.push(item);
                                        topSixPhotos.push(item);
                                    }else{
                                        var date = new Date(parseInt(item.created_time)*1000);
                                        var convertedDate = moment(date).format("YYYY-MM-DD");
                                        item.created_time=convertedDate;
                                        hashtagSortedList.push(item);
                                        topSixPhotos.push(item);
                                    }
                            });


                            hashtagSortedList.sort(function(obj1, obj2) {
                                //console.log(obj1)
                                return new Date( obj1.created_time) - new Date(obj2.created_time);
                            });
                            $scope.hashtagSortedList = hashtagSortedList;

                            topSixPhotos.sort(function(obj1, obj2) {
                                return obj1.likesCount+obj1.commentsCount - obj2.likesCount+obj2.commentsCount;
                            });
                            $scope.photoDisplayLimit=36;
                            $scope.topSixPhotos = topSixPhotos.reverse();
                            //console.log($scope.topSixPhotos);

                            var totalReach = 0
                            var totalLikes = 0
                            var totalComments = 0;
                            var totalPosts = 0;
                            var dateListing = [];
                            var likesByDate =[];
                            var postsByDate =[];
                            var previousdate;
                            var tmpsumofPost ;
                            var tmpsumoflikes;
                            var tmpsumofComments;
                            for(var i=0;i<$scope.hashtagSortedList.length;i++){
                                //console.log(totalReach);
                                if($scope.hashtagSortedList[i].followed_by!=undefined)
                                totalReach =totalReach + $scope.hashtagSortedList[i].followed_by;
                                totalLikes =totalLikes + $scope.hashtagSortedList[i].likesCount;
                                totalComments =totalComments + $scope.hashtagSortedList[i].commentsCount;
                                totalPosts = totalPosts+1;
                                if(i!==0 && Date.parse(previousdate) === Date.parse($scope.hashtagSortedList[i].created_time)){
                                    tmpsumofPost++;
                                    tmpsumofComments = tmpsumofComments + $scope.hashtagSortedList[i].commentsCount;
                                    tmpsumoflikes =tmpsumoflikes+$scope.hashtagSortedList[i].likesCount;
                                }else{

                                    dateListing.push($scope.hashtagSortedList[i].created_time);
                                    if(i!==0){
                                        likesByDate.push(tmpsumoflikes);
                                        postsByDate.push(tmpsumofPost);
                                    }
                                    tmpsumofPost =0;
                                    tmpsumoflikes=0;
                                    tmpsumofComments=0;
                                    tmpsumofPost++;
                                    tmpsumofComments = tmpsumofComments + $scope.hashtagSortedList[i].commentsCount;
                                    tmpsumoflikes =tmpsumoflikes+$scope.hashtagSortedList[i].likesCount;
                                    previousdate =$scope.hashtagSortedList[i].created_time;
                                }
                            }
                            likesByDate.push(tmpsumoflikes);
                            postsByDate.push(tmpsumofPost);
                            $("#loadingdev").hide();
                            $scope.dateListing= dateListing;
                            $scope.postsByDate= postsByDate;
                            $scope.likesByDate= likesByDate;
                            $scope.totalReach =totalReach;
                            $scope.totalLikes =totalLikes;
                            $scope.totalComments =totalComments;
                            $scope.totalPosts =totalPosts;
                            $scope.lastPostedDate = $scope.dateListing[$scope.dateListing.length-1];
                            $scope.firstPostedDate = $scope.dateListing[0];
                        }
                    }else{
                        $("#loadingdev").hide();
                    }
                });
            };
            $scope.loadMorePhotos=function(){
                $scope.photoDisplayLimit =  $scope.photoDisplayLimit+36;
            }

            //function to draw follower graph
            $scope.drawFollowerGraph = function(){
                if($scope.dailyFollower!=undefined){
                    $('#containerfollower').highcharts({
                        title: {
                            text: '',
                            x: -20 //center
                        },
                        subtitle: {
                            text: '',
                            x: -20
                        },
                        xAxis: {
                            categories: $scope.FollowerDates
                        },
                        credits: {
                            enabled: false
                        },
                        yAxis: {
                            title: {
                                text: $scope.FollowersLabel
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                        },
                        tooltip: {
                            valueSuffix: ''
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0
                        },
                        series: [{
                            name: $scope.FollowerLabel,
                            data: $scope.dailyFollower
                        }]
                    });
                }
            }
            function getWeekNumber(d) {
                // Copy date so don't modify original
                d = new Date(+d);
                d.setHours(0,0,0);
                // Set to nearest Thursday: current date + 4 - current day number
                // Make Sunday's day number 7
                d.setDate(d.getDate() + 4 - (d.getDay()||7));
                // Get first day of year
                var yearStart = new Date(d.getFullYear(),0,1);
                // Calculate full weeks to nearest Thursday
                var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
                // Return array of year and week number
                alert(weekNo)
                return [d.getFullYear(), weekNo];
            }
            //code to fetch the follower analytics
            $scope.fetchFollowerAnalytics=function(start,end,displaymode){
                if($rootScope.instagramId){
                    advertiser.getArray({
                        url: 'fetchFollowerDailyCount',
                        id:   $rootScope.instagramId
                    }).$promise.then(function(data) {
                            $translate('ANALYTICS.FOLLOWERS')
                                .then(function (translatedValue) {
                                $scope.FollowersLabel = translatedValue;
                            });
                            $translate('ANALYTICS.FOLLOWER')
                                .then(function (translatedValue) {
                                $scope.FollowerLabel = translatedValue;
                            });
                            $scope.FollowerDates = [];
                            $scope.dailyFollower = [];
                            $scope.totalFollowerByPeriod =0;
                            $scope.maxFollowerChangeByDay =undefined;
                            var firstFollowerCount = 0;
                            var highestDiffByDayInFollower =0
                            var previousMonthFollowerCount=0;
                            var currentMonthFollowerCount=0;
                            var prevFollower =0;
                            var currentMonthFollowerIncresement=0
                            var currentMonthName = moment(moment()).format("MMM");
                            var previousmonthName= moment(moment()).subtract(1,'months').format("MMM");
                            var lastMonthPreviousFollower=0;
                            var currentMonthPreviousFollower=0;
                            var currentMonthFollowerCounter = 0;
                            var lastMonthFollowerCounter = 0;
                            var currentMonth =undefined;
                            var monthlyarray=[];
                            var monthlyFollower=[];
                            var previousMonthFollower=0;
                            var currentWeek=undefined;
                            var previousWeekDate =undefined;
                            var previousWeekFollower =0;
                            var weeklyFollower=[];
                            var weeklyDateArray=[];
                            angular.forEach(data, function(item,key) {
                                var weeknumber = (moment(item.created_at).format("WW"));
                                var curr = new Date(item.created_at);
                                var day = curr.getDay();
                                var firstday = new Date(curr.getTime() - 60*60*24* (day-1)*1000);
                                
                                if(start!=undefined && end!=undefined && start!="All Days"){
                                    if(moment(item.created_at).format("YYYY-MM-DD")>=moment(start).format("YYYY-MM-DD") && moment(item.created_at).format("YYYY-MM-DD")<=moment(end).format("YYYY-MM-DD")){
                                        $scope.dailyFollower.push(parseInt(item.followercount));
                                        if(moment(item.created_at).format("MMM") == currentMonthName){
                                            if(currentMonthPreviousFollower==0){
                                                currentMonthPreviousFollower = item.followercount;
                                            }else{
                                                currentMonthFollowerCounter = currentMonthFollowerCounter+(item.followercount-currentMonthPreviousFollower);
                                                currentMonthPreviousFollower = item.followercount;
                                            }
                                        }
                                        if(moment(item.created_at).format("MMM") == previousmonthName){
                                            if(lastMonthPreviousFollower==0){
                                                lastMonthPreviousFollower = item.followercount;
                                            }else{
                                                lastMonthFollowerCounter = lastMonthFollowerCounter+(item.followercount-lastMonthPreviousFollower);
                                                lastMonthPreviousFollower = item.followercount;
                                            }
                                        }
                                        $scope.FollowerDates.push(moment(item.created_at).format("YYYY-MM-DD"));
                                        $scope.totalFollowerByPeriod =  parseInt(item.followercount);
                                        if(firstFollowerCount==0){
                                            firstFollowerCount = item.followercount;
                                            prevFollower = item.followercount;
                                           
                                        }else{
                                            if(parseInt(item.followercount)-parseInt(prevFollower)>highestDiffByDayInFollower){
                                                highestDiffByDayInFollower = parseInt(item.followercount)-parseInt(prevFollower)
                                                $scope.maxFollowerChangeByDay = {day:item.created_at,follower:highestDiffByDayInFollower};
                                            }
                                            prevFollower = item.followercount;
                                        }
                                         //monthly grouping
                                        if(currentMonth ==undefined){
                                            currentMonth = moment(item.created_at).format("MMM");
                                            previousMonthFollower = item.followercount;
                                        }else{
                                            if(currentMonth!==moment(item.created_at).format("MMM")){
                                                monthlyarray.push(currentMonth);
                                                monthlyFollower.push(previousMonthFollower);
                                                currentMonth = moment(item.created_at).format("MMM");
                                                previousMonthFollower = item.followercount;
                                            }else{
                                                previousMonthFollower = item.followercount;
                                            }
                                        }
                                        if(key==data.length-1){
                                            monthlyarray.push(currentMonth);
                                            //previousMonthFollower = item.followercount;
                                            monthlyFollower.push(previousMonthFollower);
                                            if(displaymode=="month"){
                                                
                                                $scope.FollowerDates = monthlyarray;
                                                //$scope.dailyFollower = monthlyFollower;
                                                $scope.dailyFollower = monthlyFollower.map(function (x) { 
                                                    return parseInt(x, 10); 
                                                });
                                            } 
                                            $scope.drawFollowerGraph();
                                        }
                                        //weekly grouping of data
                                        if(currentWeek == undefined){
                                            currentWeek = (moment(item.created_at).format("WW"));
                                            previousWeekDate = item.created_at;
                                            previousWeekFollower = item.followercount;
                                        }else{
                                            if(currentWeek !== moment(item.created_at).format("WW")){
                                                weeklyFollower.push(previousWeekFollower);
                                                //get the first date of the week
                                                var curr = new Date(previousWeekDate);
                                                var day = curr.getDay();
                                                var firstday = new Date(curr.getTime() - 60*60*24* (day-1)*1000);
                                                weeklyDateArray.push(moment(firstday).format('DD MMM YYYY'))
                                            }
                                            currentWeek = (moment(item.created_at).format("WW"));
                                            previousWeekFollower = item.followercount;
                                            previousWeekDate = item.created_at;
                                        }

                                        if(key==data.length-1){
                                            weeklyFollower.push(previousWeekFollower);
                                            ///get the first date of the week
                                            var curr = new Date(previousWeekDate);
                                            var day = curr.getDay();
                                            var firstday = new Date(curr.getTime() - 60*60*24* (day-1)*1000);
                                            weeklyDateArray.push(moment(firstday).format('DD MMM YYYY'))
                                            if(displaymode=="week"){
                                                
                                                $scope.FollowerDates = weeklyDateArray;
                                                //$scope.dailyFollower = monthlyFollower;
                                                $scope.dailyFollower = weeklyFollower.map(function (x) { 
                                                    return parseInt(x, 10); 
                                                });
                                            } 
                                            $scope.drawFollowerGraph();
                                        }

                                        //grouping of weekly data ends here
                                    }
                                    
                                    $scope.drawFollowerGraph();
                                   
                                }else{
                                    $scope.dailyFollower.push(parseInt(item.followercount));
                                    if(moment(item.created_at).format("MMM") == currentMonthName){
                                        if(currentMonthPreviousFollower==0){
                                            currentMonthPreviousFollower = item.followercount;
                                        }else{
                                            currentMonthFollowerCounter = currentMonthFollowerCounter+(item.followercount-currentMonthPreviousFollower);
                                            currentMonthPreviousFollower = item.followercount;
                                        }
                                    }
                                    if(moment(item.created_at).format("MMM") == previousmonthName){
                                        if(lastMonthPreviousFollower==0){
                                            lastMonthPreviousFollower = item.followercount;
                                        }else{
                                            lastMonthFollowerCounter = lastMonthFollowerCounter+(item.followercount-lastMonthPreviousFollower);
                                            lastMonthPreviousFollower = item.followercount;
                                        }
                                    }
                                    $scope.FollowerDates.push(moment(item.created_at).format("YYYY-MM-DD"));
                                    $scope.totalFollowerByPeriod =  parseInt(item.followercount);
                                    if(firstFollowerCount==0){
                                        firstFollowerCount = item.followercount;
                                        prevFollower = item.followercount;
                                       
                                    }else{
                                        if(parseInt(item.followercount)-parseInt(prevFollower)>highestDiffByDayInFollower){
                                            highestDiffByDayInFollower = parseInt(item.followercount)-parseInt(prevFollower)
                                            $scope.maxFollowerChangeByDay = {day:item.created_at,follower:highestDiffByDayInFollower};
                                        }
                                        prevFollower = item.followercount;
                                    }
                                    //monthly grouping
                                    if(currentMonth ==undefined){
                                        currentMonth = moment(item.created_at).format("MMM");
                                        previousMonthFollower = item.followercount;
                                    }else{
                                        if(currentMonth!==moment(item.created_at).format("MMM")){
                                            monthlyarray.push(currentMonth);
                                            monthlyFollower.push(previousMonthFollower);
                                            currentMonth = moment(item.created_at).format("MMM");
                                            previousMonthFollower = item.followercount;
                                        }else{
                                            previousMonthFollower = item.followercount;
                                        }
                                    }
                                    if(key==data.length-1){
                                        monthlyarray.push(currentMonth);
                                        //previousMonthFollower = item.followercount;
                                        monthlyFollower.push(previousMonthFollower);
                                        if(displaymode=="month"){
                                            $scope.dailyFollower =undefined
                                            $scope.FollowerDates = monthlyarray;
                                            //$scope.dailyFollower = monthlyFollower;
                                             $scope.dailyFollower = monthlyFollower.map(function (x) { 
                                                        return parseInt(x, 10); 
                                            });
                                        } 
                                        $scope.drawFollowerGraph();
                                    }
                                 //weekly grouping of data
                                    if(currentWeek == undefined){
                                        currentWeek = (moment(item.created_at).format("WW"));
                                        previousWeekDate = item.created_at;
                                        previousWeekFollower = item.followercount;
                                    }else{
                                        if(currentWeek !== moment(item.created_at).format("WW")){
                                            weeklyFollower.push(previousWeekFollower);
                                            //get the first date of the week
                                            var curr = new Date(previousWeekDate);
                                            var day = curr.getDay();
                                            var firstday = new Date(curr.getTime() - 60*60*24* (day-1)*1000);
                                            weeklyDateArray.push(moment(firstday).format('DD MMM YYYY'))
                                        }
                                        currentWeek = (moment(item.created_at).format("WW"));
                                        previousWeekFollower = item.followercount;
                                        previousWeekDate = item.created_at;
                                    }

                                    if(key==data.length-1){

                                        weeklyFollower.push(previousWeekFollower);
                                        ///get the first date of the week
                                        var curr = new Date(previousWeekDate);
                                        var day = curr.getDay();
                                        var firstday = new Date(curr.getTime() - 60*60*24* (day-1)*1000);
                                        weeklyDateArray.push(moment(firstday).format('DD MMM YYYY'))
                                        if(displaymode=="week"){
                                            
                                            $scope.FollowerDates = weeklyDateArray;
                                            //$scope.dailyFollower = monthlyFollower;
                                            $scope.dailyFollower = weeklyFollower.map(function (x) { 
                                                return parseInt(x, 10); 
                                            });
                                        } 
                                        $scope.drawFollowerGraph();
                                    }

                                    //grouping of weekly data ends here
                                }
                                
                                $scope.drawFollowerGraph();
                                
                            });
                            
                           /* if(lastMonthFollowerCounter){
                                $scope.averageFollowerChangePerMonth = currentMonthFollowerCounter/lastMonthFollowerCounter;
                            }else{
                                $scope.averageFollowerChangePerMonth = currentMonthFollowerCounter;
                            }*/
                            if(currentMonthPreviousFollower && lastMonthPreviousFollower){
                                $scope.noOfFollowerChangePerMonth = currentMonthPreviousFollower-lastMonthPreviousFollower;
                            }else{
                                $scope.noOfFollowerChangePerMonth = currentMonthPreviousFollower
                            }
                            $scope.followerChange = $scope.totalFollowerByPeriod-firstFollowerCount;
                        
                    });
                }
            };
            $scope.advertiserGet = function(email) {
                if($state.current.name === 'advertiser.analytics.account'){
                    $("#processing").show();
                    $scope.showLoginAnalytics = false;
                    $scope.fetchFollowerAnalytics();
                }
                $scope.postsHourlyCountArray = undefined;

                advertiser.get({
                    url: 'advertiserById',
                    id: email
                }).$promise.then(function(data) {
                    
                    if(data.campaignCount){
                        $rootScope.campaignCount = data.campaignCount;
                    }
                    var data = data.result;
                    $rootScope.userLevel = data.userLevel;
                    if(data.isTokenValid !== undefined && data.isTokenValid =="no"){
                        $scope.isTokenInValid = true;
                    }
                    if(data.instagramId){
                        $scope.instagramId = data.instagramId;
                    }
                    if(data.instagramId && $state.current.name === 'advertiser.analytics.account'){
                        $("#processing").hide();

                        $scope.blinkAnalytics = false;
                        $scope.showLoginAnalytics = false;
                        if(data.bestTimeToPost !== undefined){

                            var output =[];
                            var tmplikeByHour = [];


                            $scope.selectedTimezone = data.preferredTimezone;
                            $scope.postingData = data.bestTimeToPost
                            $scope.bestTimeOfPostByTimezone($scope.postingData,$scope.selectedTimezone);
                            angular.forEach(jQuery.parseJSON(data.bestTimeToPost), function(item) {

                                //get the user timezone
                                if(data.preferredTimezone){
                                        var date = new Date(parseInt(item.created_time)*1000);
                                        //console.log('Date-',date,'ConvertedDate-',moment(date).tz(data.preferredTimezone).format("YYYY-MM-DD HH:mm:ss"))
                                        var hour = moment(date).tz(data.preferredTimezone).format("H");
                                        var dayName = moment(date).tz(data.preferredTimezone).format("ddd");
                                        //console.log(dayName);
                                        //console.log(hour);
                                }else{
                                    var date = new Date(parseInt(item.created_time)*1000);
                                    var hour = date.getHours();
                                    var dayName = moment(date).format("ddd");
                                    //console.log(dayName);
                                }
                                //console.log(convertedDate)
                                if(output[hour] !==undefined){
                                    output[hour] = output[hour]+1;
                                    tmplikeByHour[hour] = tmplikeByHour[hour]+item.likes;
                                }else{
                                    output[hour] = 1;
                                    tmplikeByHour[hour] = item.likes;

                                }




                            });



                            $scope.postsHourlyCountArray =[];
                            $scope.avgLikesCountArray =  [];
                            $scope.hourArray = [];
                            for (var i=0; i<=output.length; i++){
                                    if(output[i]!==null && output[i] !== '' && output[i] !== undefined){
                                        $scope.hourArray.push(i);
                                        $scope.postsHourlyCountArray.push(output[i]);
                                        $scope.avgLikesCountArray.push(Math.round(tmplikeByHour[i]/output[i]));
                                    }
                            }
                            $scope.tags = jQuery.parseJSON(data.tags);
                            $translate('ANALYTICS.POSTING_ANALYTICS_LABEL')
                                .then(function (translatedValue) {
                                $scope.postingAnalyticsLabel = translatedValue;
                            });
                            $translate('ANALYTICS.AVG_LIKES')
                                .then(function (translatedValue) {
                                $scope.avgLikesLabel = translatedValue;
                            });
                            $translate('ANALYTICS.TOTAL_POSTS')
                                .then(function (translatedValue) {
                                $scope.totalPostsLabel = translatedValue;
                            });
                            $translate('HOMEPAGE.MALE')
                                .then(function (translatedValue) {
                                $scope.maleLabel = translatedValue;
                            });
                            $translate('HOMEPAGE.FEMALE')
                                .then(function (translatedValue) {
                                $scope.femaleLabel = translatedValue;
                            });
                            $scope.drawFollowerGraph();
                        }
                        else{
                             $scope.showLoginAnalytics = true;
                             $("#processing").hide();
                        }

                        $scope.countryList = undefined;
                        if(data.followerDemographics !== undefined){
                            $scope.followerDemographics = jQuery.parseJSON(data.followerDemographics);
                            $scope.malefollower =$scope.followerDemographics.gender.male;
                            $scope.femalefollower =$scope.followerDemographics.gender.female;
                            $scope.topfollowerDemographybyCountry = $scope.followerDemographics.topfollowerDemographybyCountry;
                            /*sort the countries list*/
                            var countrySortedList = [];
                            angular.forEach($scope.topfollowerDemographybyCountry, function(value,key) {
                                countrySortedList.push({name:key,value:value});
                            });
                            countrySortedList.sort(function(obj1, obj2) {
                                                // Ascending: first age less than the previous
                                                return obj1.value - obj2.value;
                                               });
                            $scope.countrySortedList = countrySortedList.reverse();
                            /*sorting for countries ends here*/
                            $scope.topfollowerDemographybyCities = $scope.followerDemographics.topfollowerDemographybyCities;

                            /*sort the cities list*/
                            var citySortedList = [];
                            angular.forEach($scope.topfollowerDemographybyCities, function(value,key) {
                                citySortedList.push({name:key,value:value});
                            });
                            citySortedList.sort(function(obj1, obj2) {
                                                // Ascending: first age less than the previous
                                                return obj1.value - obj2.value;
                                               });
                            $scope.citySortedList = citySortedList.reverse();
                            //console.log( $scope.citySortedList);
                           /*sorting for cities ends here*/

                            $scope.countryList = "{";
                            var tmpstring = "";
                            var quote ='"';
                            angular.forEach($scope.followerDemographics.topfollowerDemographybyCountry, function(value,key) {

                                    if(key != "Others"){
                                        var arr = key.split('-');
                                        tmpstring = tmpstring+quote+arr[1]+quote+":"+value+",";
                                    }


                            });
                            tmpstring = tmpstring.slice(0, -1);
                            $scope.countryList = $scope.countryList + tmpstring +"}";
                            $scope.countryList = JSON.parse($scope.countryList);
                            console.log($scope.countryList);
                            $scope.drawFollowerGraph();
                        }

                    }else{
                        $scope.showLoginAnalytics = true;
                        $("#processing").hide();
                    }
                    if(data.hashtags){
                        $scope.hastagListing = data.hashtags;
                    }
                    $scope.advertiserInfo = data;
                    $scope.initLanguage();

                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.deleteAdvertiserStat = function(){
                advertiser.get({
                    url: 'removeAdvertiserStat',
                    id: $rootScope._id
                }).$promise.then(function(data) {
                   $scope.postsHourlyCountArray = undefined;
                   $scope.advertiserGet($scope.advertiserInfo.email);
                   $state.go('advertiser.analytics.account', {}, {reload: true});
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            }
            $scope.appliedCampaign = function() {
                advertiser.getArray({
                    url: 'appliedCampaignOfAdvertiser',
                    id: $rootScope._id
                }).$promise.then(function(data) {
                    $scope.appliedCampaignList = data;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };
            $scope.fetchHubList = function() {
                advertiser.getArray({
                    url: 'fetchHubList',
                    id: $rootScope._id
                }).$promise.then(function(data) {
                    $scope.hubList = data;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };
            $scope.checkAppliedApplicants = function(campaignId) {
                var count = 0;
                angular.forEach($scope.appliedCampaignList, function(data) {
                    if (data.campaignId == campaignId) {
                        count++;
                    }
                });
                return count;
            };

            $scope.click = function() {
                $modalStack.dismissAll();
            };

            $scope.load = function() {
                $scope.credentialFunc();
            };
            $scope.show_search_icon = function() {
                $window.sessionStorage.setItem('isHome', true);
                $rootScope.search_icon = true;
            };
            $scope.showPage = function(data, subLoadPage) {
                $window.sessionStorage.setItem('isHome', false);
                $rootScope.search_icon = false;
                if (data === "campaignPage") {
                    $scope.getAllCampaign();
                    $scope.appliedCampaign();
                    $scope.campaignPage = "campaign";
                } else if (data === "analyticsPage") {
                    if (subLoadPage) {
                        $state.go('advertiser.analytics.' + subLoadPage);
                    } else {
                        $state.go('advertiser.analytics.account');
                    }
                }
                else if (data === "candidatePage") {
                    if (subLoadPage) {
                        $scope.loadCandiatePage(subLoadPage);
                        $state.go('advertiser.candidate.' + subLoadPage);
                    } else {
                        $state.go('advertiser.candidate.bookmarks');
                        $scope.loadCandiatePage('bookmarks');
                    }
                } else if (data === "messagePage") {
                    $scope.subcribleUserToMessageSender_($rootScope._id);
                    $scope.getConversationsRealtedToUser_($rootScope._id);
                    $scope.catchMessagesFromSender_();

                } else if (data === "settingsPage") {
                    if (subLoadPage) { $state.go('advertiser.settings.' + subLoadPage); } else { $state.go('advertiser.settings.profile'); }
                }
                else if (data === "cta") {
                    $scope.getAllCTAs();
                    if (subLoadPage) { $state.go('advertiser.cta.' + subLoadPage); } else { $state.go('advertiser.cta'); }
                }
            };

            $scope.isActive = function(item) {
                return $scope.selected === item;
            };


            $scope.loadCandiatePage = function(page) {
                if (page == 'applicants') {
                    $scope.allApplicantList();
                }
                if (page == 'hired') {
                    $scope.allHiredList();
                }
                if (page == 'bookmarks') {
                    $scope.bookmarkedInfluencerData();
                }
            };


            $scope.allApplicantList = function() {
                advertiser.getArray({
                    url: 'applicantList',
                    id: $rootScope._id
                }).$promise.then(function(data) {
                    $scope.applicantList = data;
                    //$scope.instagramProfileBookmark(data, "applicants");
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.allHiredList = function() {
                advertiser.getArray({
                    url: 'hiredList',
                    id: $rootScope._id
                }).$promise.then(function(data) {
                    $scope.testHireList = data;
                    //$scope.setInfluancerDetails($scope.testHireList);
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };
            $scope.bookmarkedInfluencerList = [];
            $scope.bookmarkedInfluencerData = function() {
                advertiser.getArray({
                    url: 'influencerBookmark',
                    id: $rootScope._id
                }).$promise.then(function(data) {
                    $scope.bookmarkedInfluencerList = data;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.checkInfluencer = function(influencerId) {
                var ifExist = false;
                angular.forEach($scope.bookmarkedInfluencerList, function(data) {
                    if (data == influencerId) { ifExist = true; }
                });
                return ifExist;
            };


            $scope.finalResult = [];
            $scope.getInfluencerList = function(pageNumber) {
                $scope.categories = categoryService;
                if (pageNumber < 1) {
                    pageNumber = 1;
                }
                $scope.pageNumber = pageNumber;
                advertiser.getArray({
                    url: 'getAllInfluencer',
                    page: pageNumber,
                    minPrice: $scope.filterObject.minPrice,
                    maxPrice: $scope.filterObject.maxPrice,
                    minAge: $scope.filterObject.minAge,
                    maxAge: $scope.filterObject.maxAge,
                    maxAgePlus: $scope.filterObject.maxAgePlus,
                    minFollower: $scope.filterObject.minFollower,
                    maxFollower: $scope.filterObject.maxFollower,
                    category: $scope.filterObject.campaignCategory,
                    male: $scope.filterObject.male,
                    female: $scope.filterObject.female,
                    chosenPlace: $scope.filterObject.chosenPlace
                }).$promise.then(function(result) {

                    $scope.totalPages = result.pop();

                    $scope.finalResult = result;
                    afterResult();

                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            function afterResult() {
                var result = $scope.finalResult;
                var arr = [];
                var length = result.length;
                var today = new Date();
                advertiser.getArray({
                    url: 'influencerBookmark',
                    id: $rootScope._id
                }).$promise.then(function(data) {
                    for (var i = 0; i < result.length; i++) {
                        result[i].bookmark = false;
                        if (data.length !== 0) {
                            for (var j = 0; j < data.length; j++) {
                                if (data[j].influencerId !== null && data[j].influencerId.instagramId == result[i].instagramId) {
                                    result[i].bookmark = true;
                                    break;
                                }
                            }
                        }
                        if (result[i].aboutMe.birthday) {
                            var birthDate = new Date(result[i].aboutMe.birthday);
                            var age = today.getFullYear() - birthDate.getFullYear();
                            var m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }

                            arr.push(result[i]);
                        } else {
                            arr.push(result[i]);
                        }
                    }
                    $scope.allInfluencer = arr;

                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            }

            $scope.instagramProfileBookmark = function(result, type) {
                var bk = [];
                angular.forEach(result, function(data) {
                    if (data.influencerId !== null) {
                        advertiser.get({
                            url: 'getInstagramProfileAd',
                            id: data.influencerId.instagramId,
                            extraId: data.influencerId.accesstoken
                        }).$promise.then(function(finalResult) {
                            data.influencerId.followed_by = finalResult.followed_by;
                            data.influencerId.averageLikes = finalResult.averageLikes;
                            data.influencerId.averageComments = finalResult.averageComments;
                            if (data.influencerId.profilePhoto === undefined) {
                                data.influencerId.profilePhoto = finalResult.profilePicture;
                            }
                            bk.push(data);
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                    }
                });
                if (type == "bookmarked") $scope.bookmarkedInfluencerList = bk;
            };

            $scope.setInfluancerDetails = function(influencerList) {
                angular.forEach(influencerList, function(data) {
                    if (data.influencerId !== null) {
                        advertiser.get({
                            url: 'getInstagramProfileAd',
                            id: data.influencerId.instagramId,
                            extraId: data.influencerId.accesstoken
                        }).$promise.then(function(finalResult) {

                            data.influencerId.followed_by = finalResult.followed_by;
                            data.influencerId.averageLikes = finalResult.averageLikes;
                            data.influencerId.averageComments = finalResult.averageComments;
                            if (data.influencerId.profilePhoto === undefined) {
                                data.influencerId.profilePhoto = finalResult.profilePicture;
                            }
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                    }
                });
            };

            //view the single influencer details
            $scope.influencerDetailsFunc = function() {
                $scope.singleInfluencerDetails= null;
                advertiser.get({
                    url: 'influencerData',
                    id: $state.params.influencerId
                }).$promise.then(function(data) {
                    $scope.countryList = undefined;
                    $scope.followerDemographics = undefined;
                    $scope.malefollower =undefined;
                    $scope.femalefollower =undefined;
                    $scope.topfollowerDemographybyCountry = undefined;
                    $scope.topfollowerDemographybyCities = undefined;
                    $scope.tags = undefined;
                    $scope.singleInfluencerDetails = data;
                    $scope.loadInfuencerMedia($scope.singleInfluencerDetails.instagramId);
                    $scope.instagramSavedPhotoList ={};
                    $scope.countryList = "{";
                    if(data.followerDemographics !== undefined){
                        $scope.followerDemographics = jQuery.parseJSON(data.followerDemographics);
                        $scope.malefollower =$scope.followerDemographics.gender.male;
                        $scope.femalefollower =$scope.followerDemographics.gender.female;
                        $scope.topfollowerDemographybyCountry = $scope.followerDemographics.topfollowerDemographybyCountry;
                        /*sort the countries list*/
                        var countrySortedList = [];
                        angular.forEach($scope.topfollowerDemographybyCountry, function(value,key) {
                            countrySortedList.push({name:key,value:value});
                        });
                        countrySortedList.sort(function(obj1, obj2) {
                                            // Ascending: first age less than the previous
                                            return obj1.value - obj2.value;
                                           });
                        $scope.countrySortedList = countrySortedList.reverse();
                        /*sorting for countries ends here*/
                        $scope.topfollowerDemographybyCities = $scope.followerDemographics.topfollowerDemographybyCities;

                        /*sort the cities list*/
                        var citySortedList = [];
                        angular.forEach($scope.topfollowerDemographybyCities, function(value,key) {
                            citySortedList.push({name:key,value:value});
                        });
                        citySortedList.sort(function(obj1, obj2) {
                                            // Ascending: first age less than the previous
                                            return obj1.value - obj2.value;
                                           });
                        $scope.citySortedList = citySortedList.reverse();
                       /*sorting for cities ends here*/
                        $scope.countryList = "{";
                        var tmpstring = "";
                        var quote ='"';
                        angular.forEach($scope.followerDemographics.topfollowerDemographybyCountry, function(value,key) {

                                    if(key != "Others"){
                                        var arr = key.split('-');
                                        tmpstring = tmpstring+quote+arr[1]+quote+":"+value+",";
                                    }


                            });
                        tmpstring = tmpstring.slice(0, -1);
                        $scope.countryList = $scope.countryList + tmpstring +"}";
                        $scope.countryList = JSON.parse($scope.countryList);
                         $translate('HOMEPAGE.MALE')
                                .then(function (translatedValue) {
                                $scope.maleLabel = translatedValue;
                        });
                        $translate('HOMEPAGE.FEMALE')
                            .then(function (translatedValue) {
                            $scope.femaleLabel = translatedValue;
                        });
                    }

                    if(data.tags){
                        $scope.tags = jQuery.parseJSON(data.tags);
                    }

                    //get the instagram profile
                    advertiser.get({
                        url: 'getInstagramProfileAd',
                        id: $scope.singleInfluencerDetails.instagramId,
                        extraId: $scope.singleInfluencerDetails.accesstoken
                    }).$promise.then(function(finalResult) {
                        if(finalResult.response === undefined){
                            /*$scope.singleInfluencerDetails.followed_by = finalResult.followed_by;
                            $scope.singleInfluencerDetails.averageLikes = finalResult.averageLikes;
                            $scope.singleInfluencerDetails.averageComments = finalResult.averageComments;
                            if ($scope.singleInfluencerDetails.profilePhoto === undefined) {
                                $scope.singleInfluencerDetails.profilePhoto = finalResult.profilePicture;
                            }*/
                        }
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });

                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });

            };

            $scope.loadInfuencerMedia = function(influencerId) {
                $scope.instagramSavedPhotoList = [];
                instagramMedia.getArray({ url: 'getInstagramMediaByInstagramId', id: influencerId })
                    .$promise.then(function(data) {
                        $scope.instagramSavedPhotoList = data;
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
            };

            $scope.editCampaign = function(id) {
                $scope.pageCampaign = "edit";
                $scope.getSignleCampaign(id);
            };

            $scope.viewSignleCampaign = function() {
                advertiser.get({
                    url: 'campaign',
                    id: $state.params.campaignId
                }).$promise.then(function(result) {
                    $scope.singleCampaignDetails = result;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.getSignleCampaign = function(id) {
                advertiser.get({
                    url: 'campaign',
                    id: id
                }).$promise.then(function(result) {
                    result.visiblePrivate = result.visiblePrivate.toString();
                    $scope.campaign = result;
                    var date = new Date($scope.campaign.dueDate);
                    $scope.campaign.day = date.getDate();
                    $scope.campaign.month = date.getMonth();
                    $scope.campaign.year = date.getFullYear();
                    $scope.createEditPopUp();
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.createCampaignPopUp = function() {
                //set the default date for the campaign
                //alert($rootScope.userLevel,$rootScope.campaignCount);
                if($rootScope.userLevel){
                    if($rootScope.userLevel === "Trial" && $rootScope.campaignCount>=1){
                        $scope.trialLimitedCampaignPopUp();
                    }else{
                        var date = new Date();
                        $scope.campaign = {};
                        $scope.campaign.day = date.getDate();
                        $scope.campaign.month = date.getMonth();
                        $scope.campaign.year = date.getFullYear();
                        $scope.pageCampaign = "new";
                        $scope.createEditPopUp();
                    }
                }
            };
            $scope.trialLimitedCampaignPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/limited.access.campaignpopup.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };
            $scope.createEditPopUp = function() {

                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/popup/campaign.create.html',
                    size: 'lg',
                    windowClass: 'xx-dialog',
                    controller: 'CampaignCtrl',
                    scope: $scope,
                    resolve: {
                        pageCampaign: function() {
                            return $scope.pageCampaign;
                        },
                        campaign: function() {
                            return $scope.campaign;
                        }
                    }
                });
            };

            $scope.categoryPopup = function() {
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/popup/advertiser.category.popup.html',
                    windowClass: 'xx-dialog',
                    size: 'md',
                    controller: 'AdvertiserCtrl'
                });
            };

            $scope.catgeoryArray = function(object) {
                $rootScope.categoryData = {};
                $rootScope.categoryData = object;
            };

            $scope.checkCategory = function(object) {
                var ifExist = false;
                if ($rootScope.categoryData == object) ifExist = true;
                return ifExist;
            };

            $scope.campaignUpdate = function(data, form, button) {
                $scope.create = {};
                $scope.create.campaignStatus = button;
                if (form.$valid) {
                    for (var key in data) {
                        if (key == 'day' || key == 'month' || key == 'year')
                            continue;

                        if (key == "_id" || key == 'campaignStatus' || key == '$promise' || key == '$resolved') {} else {
                            $scope.create[key] = data[key];
                        }
                    }
                    $scope.create.dueDate = new Date($scope.months[data.month].name + " " + data.day + "," + data.year);
                    if ($rootScope.categoryData) $scope.create.campaignCategory = $rootScope.categoryData;
                    $scope.create.campaignImage = $scope.campaignImage;
                    advertiser.save({
                        url: 'campaignUpdate',
                        id: data._id
                    }, $scope.create).$promise.then(function(result) {
                        $scope.emailUpdate(data.advertiserId, $scope.create.campaignStatus, data.campaignTitle);
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                } else {
                    return false;
                }
            };

            $scope.emailUpdate = function(advertiserId, campaignStatus, campaignName) {
                $scope.create = {};
                $scope.create.campaignStatus = campaignStatus;
                $scope.create.campaignName = campaignName;
                advertiser.save({
                    url: 'advertiserEmail',
                    id: advertiserId
                }, $scope.create).$promise.then(function(result) {
                    $scope.campaignUpdatePopUp();
                    $state.go("advertiser.campaign.home", {}, {
                        reload: true
                    });
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.campaignSave = function(data, form, button) {
                if (form.$valid) {

                    $scope.create = {};
                    for (var key in data) {
                        if (key == 'day' || key == 'month' || key == 'year')
                            continue;
                        $scope.create[key] = data[key];
                    }
                    $scope.create.dueDate = new Date($scope.months[data.month].name + " " + data.day + "," + data.year);

                    $scope.create.campaignCategory = $rootScope.categoryData;
                    $scope.create.campaignImage = $scope.campaignImage;
                    $scope.create.campaignStatus = button;

                    $scope.create.advertiserId = $rootScope._id;
                    advertiser.save({
                        url: 'campaign'
                    }, $scope.create).$promise.then(function(result) {
                        $scope.getAllCampaign();
                        $scope.campaignSavePopUp();
                        return false;
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                } else {
                    return false;
                }
            };

            $scope.uploadFiles = function(file, errFiles) {
                if (errFiles.$error) translateGrowl.translateGrowlMessage('ADVERTISER.FILE_UPLOAD_ERROR_MESSAGE', 'error');
                if (file) {

                     Upload.upload({
                        url: 'imgupload', //webAPI exposed to upload the file
                        headers : {
                            'Content-Type': file.type
                         },
                        data:{file:file} //pass file as data, should be user ng-model
                        }).then(function (resp) { //upload function returns a promise
                            if(resp.data.error_code === 0){ //validate success
                               // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                                 $scope.campaignImage = resp.data.result.secure_url;
                            } else {

                            }
                        }, function (resp) { //catch error
                           /* console.log('Error status: ' + resp.status);
                            $window.alert('Error status: ' + resp.status);*/
                        }, function (evt) {
                         /*   console.log(evt);
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                            vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress*/
                        });

                }
            };

            $scope.uploadProfile = function(file, errFiles) {
                if (errFiles.$error) translateGrowl.translateGrowlMessage('ADVERTISER.FILE_UPLOAD_ERROR_MESSAGE', 'error');
                if (file) {
                    Upload.upload({
                    url: 'imgupload', //webAPI exposed to upload the file
                    headers : {
                        'Content-Type': file.type
                     },
                    data:{file:file} //pass file as data, should be user ng-model
                    }).then(function (resp) { //upload function returns a promise
                        if(resp.data.error_code === 0){ //validate success
                           // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                            $scope.profile = resp.data.result.secure_url;
                            $scope.advertiserInfo.profile = resp.data.result.secure_url;
                        } else {

                        }
                    }, function (resp) { //catch error
                       /* console.log('Error status: ' + resp.status);
                        $window.alert('Error status: ' + resp.status);*/
                    }, function (evt) {
                     /*   console.log(evt);
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                        vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress*/
                    });
                }

            };
            $scope.uploadHubBackgroundPhoto = function(file, errFiles) {
                if (errFiles.$error) translateGrowl.translateGrowlMessage('ADVERTISER.FILE_UPLOAD_ERROR_MESSAGE', 'error');
                if (file) {
                    Upload.upload({
                    url: 'imgupload', //webAPI exposed to upload the file
                    headers : {
                        'Content-Type': file.type
                     },
                    data:{file:file} //pass file as data, should be user ng-model
                    }).then(function (resp) { //upload function returns a promise
                        if(resp.data.error_code === 0){ //validate success
                           // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                          console.log(resp)
                           $scope.backgroundPhotoUrl = resp.data.result.secure_url;
                        } else {

                        }
                    }, function (resp) { //catch error
                    }, function (evt) {
                    });
                }

            };
            $scope.campaignUpdatePopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/campaign.update.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };
            $scope.trialLimitedAccessPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/limited.access.popup.html', 'AdvertiserCtrl', 'md', 'xx-dialog');

            };
            $scope.campaignSavePopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/campaign.create.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.getAllCampaign = function() {
                advertiser.getArray({
                    url: 'getAllCampaign',
                    id: $rootScope._id
                }).$promise.then(function(result) {
                    $scope.campaignList = result;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
                
            };

            $scope.getAllApprovedCampaign = function() {
                advertiser.query({
                    url: 'getAllApprovedCampaign',
                    id: $rootScope._id
                }).$promise.then(function(result) {
                    $scope.campaignList = result;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.calculateAge = function(dateString) {
                var today = new Date();
                var birthDate = new Date(dateString);
                var age = today.getFullYear() - birthDate.getFullYear();
                var m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age;
            };

            $scope.bookmarkedInfluencerFunc = function(influencerId, checked, index) {
                var obj = {};
                obj.advertiserId = $rootScope._id;
                obj.influencerId = influencerId;
                advertiser.save({
                    url: 'influencerBookmark'
                }, obj).$promise.then(function(result) {
                    $scope.bookmarkedInfluencerData();
                    if (result.message == "unbookmarked influencer") {
                        if (index)
                            $scope.allInfluencer[index].bookmark = false;
                        $scope.unBookmarkPopUp();
                    } else {
                        if (index)
                            $scope.allInfluencer[index].bookmark = true;
                        $scope.bookmarkPopUp();
                    }
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.bookmarkPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/bookmark.influencer.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.unBookmarkPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/unbookmarked.influencer.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.makePrivate = function(campaignId, visiblity) {
                var obj = {};
                obj.visiblePrivate = visiblity;
                advertiser.save({
                    url: 'updateCampaignVisiblity',
                    id: campaignId
                }, obj).$promise.then(function(result) {
                    $scope.visiblityPopUp();
                    $scope.getAllCampaign();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.visiblityPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.visiblity.update.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.deletePopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.campaign.delete.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };


            $scope.deleteCampaign = function(campaignId) {
                advertiser.get({
                    url: 'deleteCampaign',
                    id: campaignId
                }).$promise.then(function(result) {
                    $scope.deletePopUp();
                    $scope.getAllCampaign();
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.openAndCloseCampaign = function(campaignId, status) {
                var object = {};
                object.status = status;
                object._id = campaignId;
                advertiser.save({
                    url: 'changeCampaignStatus'
                }, object).$promise.then(function(result) {
                    if (status == "Close") $scope.afterPaymentCloseSuccessPop();
                    if (status == "Accept") $scope.reopenPopUp();
                    $scope.getAllCampaign();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.reopenPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.campaign.reopen.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.duplicatePopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.campaign.duplicate.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.duplicateCampaign = function(campaign) {
                var object = {};
                for (var key in campaign) {
                    if (key == "_id") {} else if (key == 'campaignStatus') object.campaignStatus = "Pending";
                    else object[key] = campaign[key];
                }
                advertiser.save({
                    url: 'campaign'
                }).$promise.then(function(result) {
                    $scope.duplicatePopUp();
                    $scope.getAllCampaign();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.inviteInfluencerPopUp = function(influencer, index) {
                $scope.invitePop(influencer);
            };

            $scope.messageInfluencerPopUp = function(influencer) {
                $scope.messagePop(influencer);
            };

            $scope.analyticsInfluencerPopUp = function(influencer) {
                if(influencer!= undefined && influencer !==null && influencer.tags){
                    var modalInstance = $modal.open({
                        templateUrl: 'modules/users/views/influencer/analytics/influencer.client.analyticspopup.html',
                        size: 'md',
                        windowClass: 'infludetail-analy',
                        scope: $scope,
                        controller: 'AdvertiserCtrl'
                    });
                }
            };

            $scope.analyticsInfluencerTrialPopUp = function(influencer) {
                if(influencer!= undefined && influencer !==null && influencer.tags){
                    var modalInstance = $modal.open({
                        templateUrl: 'modules/users/views/advertiser/analytics/influencer.trial.analyticspopup.html',
                        size: 'md',
                        windowClass: 'infludetail-analy',
                        controller: 'AdvertiserCtrl'
                    });
                }
            };

            $scope.hireInfluencerPopUp = function(influencer, conversationId, campaignId) {
                $scope.hirePop(influencer, conversationId, campaignId);
            };

            $scope.invitePop = function(influencer) {

                if (typeof influencer == 'string') {
                    advertiser.get({
                        url: 'singleInfluencer',
                        id: influencer
                    }).$promise.then(function(result) {
                        influencer = result;
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }
                $modalStack.dismissAll();

                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/popup/advertiser.influencer.invite.html',
                    size: 'md',
                    controller: 'InviteCtrl',
                    windowClass: 'xx-dialog',
                    resolve: {
                        campaignList: function() {
                            return $scope.campaignList;
                        },
                        influencer: function() {
                            return influencer;
                        }
                    }
                });
            };

            $scope.messagePop = function(influencer) {
                $modalStack.dismissAll();
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/popup/advertiser.influencer.message.html',
                    size: 'md',
                    windowClass: 'xx-dialog',
                    controller: 'InviteCtrl',
                    resolve: {
                        campaignList: function() {
                            return $scope.campaignList;
                        },
                        influencer: function() {
                            return influencer;
                        }
                    }
                });
            };

            $scope.hirePop = function(influencer, conversationId, campaignId) {
                $modalStack.dismissAll();
                var serviceFeesmultiplier = 0;
                console.log($rootScope.userLevel);
                if($rootScope.userLevel == 'Standard'){

                    serviceFeesmultiplier = 30;
                }
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/popup/advertiser.influencer.hire.html',
                    size: 'md',
                    windowClass: 'xx-dialog',
                    controller: 'HireCtrl',
                    resolve: {
                        campaignList: function() {
                            return $scope.campaignList;
                        },
                        influencer: function() {
                            return influencer;
                        },
                        conversationId: function() {
                            return conversationId;
                        },
                        campaignId: function() {
                            return campaignId;
                        },
                        userLevel: function() {
                            return $scope.advertiserInfo.userLevel;
                        },
                        serviceFeesmultiplier: function() {
                            return serviceFeesmultiplier;
                        }
                    }
                });
            };

            $scope.hireSave = function(data, influencer, form, campaignId, conversationId,payMethod) {

                if (form.$valid) {
                    var object = {};
                    advertiser.get({
                            url: "singleConversation",
                            campaignId: data.campaignId,
                            influencerId: influencer._id,
                            advertiserId: $rootScope._id
                        })
                        .$promise.then(function(result) {
                            if (result._id && (result.status == 'hired' ||
                                    result.status == 'close' || result.status == 'inReview' || result.status == 'changesRequired' || result.status == 'completed')) {
                                $scope.alreadyExist = true;
                                return false;
                            }
                            if (influencer._id) object.recipient = influencer._id;
                            else object.recipient = influencer;
                            object.sender = $rootScope._id;
                            object.message = data.message;
                            if (conversationId) {
                                object.conversation = conversationId;
                            }
                            object.heading = 'hired';
                            object.type = 'normal';
                            object.statusChanged = true;
                            var object1 = {};
                            if (campaignId) {
                                $scope.hireCampaignId = data.campaignId;
                                object1.campaignId = campaignId;
                            } else {
                                object1.campaignId = data.campaignId;
                            }
                            if(payMethod == 'bank'){
                                object.payMethod = 'bank';
                                object1.payMethod = 'bank';
                            }else{
                                object.userLevel = $rootScope.userLevel;
                                object1.userLevel = $rootScope.userLevel;
                                object.payMethod = 'paypal';
                                object1.payMethod = 'paypal';
                            }

                            object1.influencerId = influencer._id;
                            object1.advertiserId = $rootScope._id;
                            object1.message = data.message;
                            object1.status = "hired";

                            object1.currenturl = $location.path();
                            if(payMethod == 'bank'){
                                object1.price = data.payment;
                            }else{
                                if($rootScope.userLevel == "Standard"){
                                    object1.price = data.payment + data.payment * 30 / 100;
                                }else{
                                    object1.price = data.payment;
                                }
                            }

                            if (conversationId) {
                               $scope.hireCampaignApiUpdate(object, object1, conversationId);
                            } else {
                               $scope.hireCampaignApi(object, object1);
                            }
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                } else {
                    return false;
                }
            };

            $scope.hireCampaignApi = function(object, object1) {
                advertiser.save({
                    url: 'conversation'
                }, object1).$promise.then(function(result) {
                    object.conversation = result._id;
                    //$scope.sendMessageToReciver_(object);
                    //$scope.sendMessage(object);
                    window.location.href = result.url;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.hireCampaignApiUpdate = function(object, object1, conversationId) {
                advertiser.save({
                    url: 'conversation',
                    id: conversationId
                }, object1).$promise.then(function(result) {
                    //$scope.sendMessageToReciver_(object);
                    window.location.href = result.url;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.requestChangeQuote = function(conversationId, campaignId, recipient, index) {
                $modalStack.dismissAll();
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/popup/influencer.requestChange.quote.html',
                    size: 'md',
                    controller: 'RequestCtrl',
                    windowClass: 'xx-dialog',
                    resolve: {
                        conversationId: function() {
                            return conversationId;
                        },
                        campaignId: function() {
                            return campaignId;
                        },
                        recipient: function() {
                            return recipient;
                        },
                        index: function() {
                            return index;
                        }
                    }
                });
            };

            $scope.closePop = function() {
                $modalStack.dismissAll();
            };

            $scope.requestChangesPopUp = function(form, data, conversationId, campaignId, recipient, index) {
                if (form.$valid) {
                    var object1 = {};
                    object1.recipient = recipient;
                    object1.conversation = conversationId;
                    object1.sender = $rootScope._id;
                    object1.message = data.message;
                    object1.heading = 'Request Changes';
                    object1.type = 'changeRequest';
                    object1.statusChanged = true;
                    var object = {};
                    object.status = 'changesRequired';
                    $scope.requestChangeSave(object, object1, conversationId, campaignId, recipient, index);
                } else {
                    return false;
                }
            };

            $scope.requestChangeSave = function(object, object1, conversationId, campaignId, recipient, index) {
                advertiser.save({
                    url: 'conversation',
                    id: conversationId
                }, object).$promise.then(function(result) {
                    $scope.sendMessageToReciver_(object1);
                    $scope.afterchangeRequestPopUp();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.afterchangeRequestPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/influencer.requestChange.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.afterhirePopUp = function(campaignId) {
                $modalStack.dismissAll();
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/advertiser/popup/advertiser.influencer.hire.after.html',
                    size: 'md',
                    windowClass: 'xx-dialog',
                    controller: 'AfterHireCtrl',
                    resolve: {
                        campaignId: function() {
                            return campaignId;
                        }
                    }
                });
            };

            $scope.closeCampaignPop = function(campaignId) {
                var object = {};
                object.campaignStatus = "Close";
                advertiser.save({
                    url: 'campaignClose',
                    id: campaignId
                }, object).$promise.then(function(result) {
                    advertiser.get({
                        url: 'expireHireSession'
                    }).$promise.then(function(data1) {
                        $scope.afterPaymentCloseSuccessPop();
                        return false;
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.afterPaymentCloseSuccessPop = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.campaign.close.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.inviteSave = function(data, influencer, form) {
                if (form.$valid) {
                    advertiser.get({
                            url: "singleConversation",
                            campaignId: data.campaignId,
                            influencerId: influencer._id,
                            advertiserId: $rootScope._id
                        })
                        .$promise.then(function(result) {
                            if (result._id) {
                                $scope.alreadyExist = true;
                                return false;
                            }
                            var object = {};
                            object.recipient = influencer._id;
                            object.sender = $rootScope._id;
                            object.message = data.message;
                            object.heading = "Invited";
                            object.type = "normal";
                            object.statusChanged = true;
                            var object1 = {};
                            object1.campaignId = data.campaignId;
                            object1.influencerId = influencer._id;
                            object1.advertiserId = $rootScope._id;
                            object1.status = "invited";
                            //object1.price = data.price;
                            $scope.inviteInfluencerApi(object, object1);
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                } else {
                    return false;
                }
            };

            $scope.messageSave = function(data, influencer, form) {
                if (form.$valid) {
                    var object = {};
                    object.recipient = influencer._id;
                    object.sender = $rootScope._id;
                    object.message = data.message;
                    object.conversation = data.conversationId;
                    $scope.sendMessage(object);
                    $scope.messageSuccessPop();
                } else {
                    return false;
                }
            };

            $scope.messageSuccessPop = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.influencer.message.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.inviteSuccessPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.influencer.invite.success.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.getMessageData = function() {
                socket.emit('allList', $rootScope._id);
                socket.on('allMessageList', function(msgs) {
                    $scope.messageData = msgs;
                    $scope.getListOfUser();
                });
            };

            $scope.getListOfUser = function() {
                $scope.messageUserList = [];
                angular.forEach($scope.messageData, function(data) {
                    var exist;
                    var object;
                    var tmpPath = data.fileLink;
                    if (tmpPath) {
                        var extIndex = tmpPath.lastIndexOf('.');
                        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
                        if (extension == '.pdf') {
                            data.fileLink = "pdf-icon.png";
                        }
                    }
                    if (data.sender == $rootScope._id) {
                        exist = $scope.checkExistence($scope.messageUserList, data.recipient, data.campaign);

                        if (exist == -1) $scope.messageUserList.push({
                            'id1': data.sender,
                            'id2': data.recipient,
                            'campaignId': data.campaign,
                            'messages': [{
                                'message': data.message,
                                'time': data.timeSent,
                                'user': 'sender',
                                'senderId': data.recipient,
                                'fileLink': data.fileLink,
                                'type': data.type,
                                'heading': data.heading
                            }]
                        });
                        else {
                            object = {
                                'message': data.message,
                                'time': data.timeSent,
                                'user': 'sender',
                                'fileLink': data.fileLink,
                                'type': data.type,
                                'heading': data.heading
                            };
                            $scope.messageUserList[exist]['messages'].push(object);
                        }
                    }
                    if (data.recipient == $rootScope._id) {
                        exist = $scope.checkExistence($scope.messageUserList, data.sender, data.campaign);
                        if (exist == -1) $scope.messageUserList.push({
                            'id1': data.recipient,
                            'id2': data.sender,
                            'campaignId': data.campaign,
                            'messages': [{
                                'message': data.message,
                                'time': data.timeSent,
                                'user': 'recipient',
                                'senderId': data.sender,
                                'fileLink': data.fileLink,
                                'type': data.type,
                                'heading': data.heading
                            }]
                        });
                        else {
                            object = {
                                'message': data.message,
                                'time': data.timeSent,
                                'user': 'recipient',
                                'fileLink': data.fileLink,
                                'type': data.type,
                                'heading': data.heading
                            };
                            $scope.messageUserList[exist]['messages'].push(object);
                        }
                    }
                });
                if ($scope.messageUserList[0]) {
                    $scope.getSingleMessageLoad($scope.messageUserList[0].id2, $scope.messageUserList[0].campaignId, 0);
                }
                $scope.influencerDetail();
                $scope.allUserCampaignMessageStatus();
                $scope.allUserCampaign();
            };


            $scope.checkExistence = function(array, id, campaign) {
                return _.findIndex(array, {
                    'id2': id,
                    'campaignId': campaign
                });
            };

            $scope.getSingleMessageLoad = function(id, campaign, index) {
                $scope.selected1 = index;
                $scope.messageLoad = _.find($scope.messageUserList, {
                    'id2': id,
                    'campaignId': campaign
                });
            };

            $scope.influencerDetail = function() {
                $scope.allInfluencer = [];
                angular.forEach($scope.messageUserList, function(object) {
                    if (object.id2) {
                        advertiser.get({
                            url: 'influencerData',
                            id: object.id2
                        }).$promise.then(function(data) {
                            $scope.allInfluencer.push(data);
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                    }
                });
            };

            $scope.sendMessageData = function(recipient, message, form, conversation, fileLink, heading, type) {
                // console.log('form data \n' + form);
                if(form === 'msg*from*checkIfEnterKeyWasPressed'){
                    var object = {};
                    object.recipient = recipient;
                    object.recipientType = 'Influencer';
                    object.sender = $rootScope._id;
                    object.message = message;
                    object.conversation = conversation;
                    object.fileLink = fileLink;
                    object.heading = heading;
                    object.type = type;
                    // form.$valid = false;
                    $scope.sendMessageToReciver_(object);
                    //$scope.getMessageData();
                }
                else if (form.$valid) {
                    var object = {};
                    object.recipient = recipient;
                    object.recipientType = 'Influencer';
                    object.sender = $rootScope._id;
                    object.message = message;
                    object.conversation = conversation;
                    object.fileLink = fileLink;
                    object.heading = heading;
                    object.type = type;
                    form.$valid = false;
                    $scope.sendMessageToReciver_(object);
                    //$scope.getMessageData();
                } else {
                    return false;
                }
            };

            /**
             * message handling
             * start code
             **/
            $scope.offset=0;
            $scope.page = 10;

            $scope.getConversationsRealtedToUser_ = function(userId) {
                advertiser.getArray({
                    url: 'userConversations',
                    id: userId
                }).$promise.then(function(data) {
                    $scope.conversationList = data;
                    console.log($scope.conversationList);
                    if (!sessionStorage.selectedConversationId) {
                        if (data[0]) {
                            sessionStorage.selectedConversationId = data[0]._id;
                            $scope.selectedConversation = data[0];
                            $scope.conversationId = data[0]._id;
                        }
                    }
                    $scope.getmessagesRealtedToUser_(userId);

                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.getmessagesRealtedToUser_ = function(userId,callback) {
                console.log('1. offset is= '+$scope.offset);
                $http({
                    url: "/getByOffset",
                    method: "get",
                    params: { offset: $scope.offset ,conversationId:sessionStorage.selectedConversationId }
                }).then(function (response) {
                    console.log('2. offset in then = '+$scope.offset);
                    console.log(response.data);
                    if($scope.offset === 0) {
                        $scope.messageList = response.data;
                        console.log('if offset === 0');
                        $scope.setScrollLast();
                        if(typeof callback === 'function')
                          callback();
                    }
                    else {
                        console.log('3. offset in else = '+$scope.offset);
                        if(response.data.length === 0) $scope.setScroll(5);
                        else {

                            console.log('3. offset in else = '+$scope.offset);
                            if(response.data.length === 0) $scope.setScroll(1);
                            else {
                              var prevHeight = $('#message_right_body').prop('scrollHeight');
                              $scope.messageList = $scope.messageList.concat(response.data.reverse());


                              setTimeout(function() {
                                 var curHeight = $('#message_right_body').prop('scrollHeight');

                                   if($scope.firstScroll == undefined){
                                     $('#message_right_body').scrollTop(curHeight-prevHeight);
                                     $scope.firstScroll = true;
                                   }else
                                       $('#message_right_body').scrollTop(curHeight-prevHeight-310);
                              }, 90);
                            }


                        }

                    }
                    //console.log($scope.messageList);
                    setTimeout(function() {
                        $scope.scrollCheck();
                    }, 1000);

                });
            };


            $scope.scrollCheck = function () {
                console.log("ScrollCheck called ... ");
                $('#message_right_body').scroll( function () {
                    //console.log("Scroll check pos = " + $('#message_right_body').scrollTop());
                    if ($('#message_right_body').scrollTop() == 0) {
                        // alert('end reached');
                        $scope.removescrollEvent();
                        console.log('inside scroll function');
                        $scope.offset = $scope.offset + $scope.page;
                        console.log($scope.offset);
                        $scope.getmessagesRealtedToUser_($rootScope._id);
                    }
                });
            };


            $scope.setScroll = function(value) {
                setTimeout(function() {
                    $('#message_right_body').scrollTop(value);
                }, 200);

            };

            $scope.setScrollLast = function() {
                setTimeout(function() {
                    console.log("1 scroll set to last" + $('#message_right_body')[0].scrollHeight*2);
                    // $('#message_right_body').scrollTop(9000000);

                    $('#message_right_body').scrollTop(50000);
                //     // var message_body = $('#message_right_body');
              }, 90);

            };


            $scope.sendBtn = function($event) {
                $event.preventDefault();
                var textmsg = $('#chat_text_area').val();
                if(textmsg != '') {
                    // console.log("SENT : " + $scope.selectedConversation.influencerId._id + " " + textmsg + " " + $scope.selectedConversation._id);
                    $scope.sendMessageData($scope.selectedConversation.influencerId._id, textmsg, 'msg*from*checkIfEnterKeyWasPressed', $scope.selectedConversation._id, '', '', 'normal');
                    $('#chat_text_area').val('');
                    $scope.setScrollLast();
                }

            };

            $scope.checkIfEnterKeyWasPressed = function($event) {
                if($event.keyCode === 13 && !$event.shiftKey){
                    $event.preventDefault();
                    var textmsg = $('#chat_text_area').val();
                    if(textmsg != '') {
                        // console.log("SENT : " + $scope.selectedConversation.influencerId._id + " " + textmsg + " " + $scope.selectedConversation._id);
                        $scope.sendMessageData($scope.selectedConversation.influencerId._id, textmsg, 'msg*from*checkIfEnterKeyWasPressed', $scope.selectedConversation._id, '', '', 'normal');
                        $('#chat_text_area').val('');
                        $scope.setScrollLast();
                    }
                }

            };
            $scope.removescrollEvent = function () {
                $('#message_right_body').off("scroll");

                console.log("Removed Scroll event");
            };


                        $window.onpopstate = function(event) {

                            console.log("current state");
                            console.log(sessionStorage.messageState);
                            if(sessionStorage.messageState  == 2){
                                $('#message_right').addClass('hidden-md');
                                $('#message_right').addClass('hidden-sm');
                                $('#message_right').addClass('hidden-xs');
                                $('#message_left').removeClass('hidden-md');
                                $('#message_left').removeClass('hidden-sm');
                                $('#message_left').removeClass('hidden-xs');
                                sessionStorage.messageState = 1;

                            }
                            else if(sessionStorage.messageState  == 1){
                                $('#message_left').addClass('hidden-md');
                                $('#message_left').addClass('hidden-sm');
                                $('#message_left').addClass('hidden-xs');
                                $('#message_right').removeClass('hidden-md');
                                $('#message_right').removeClass('hidden-sm');
                                $('#message_right').removeClass('hidden-xs');

                            }
                            else{

                                $('#message_right').addClass('hidden-md');
                                $('#message_right').addClass('hidden-sm');
                                $('#message_right').addClass('hidden-xs');
                                $('#message_left').removeClass('hidden-md');
                                $('#message_left').removeClass('hidden-sm');
                                $('#message_left').removeClass('hidden-xs');
                            }


                        };

   $scope.selecteConvesation = function(conversation) {
     var w  = $(window).width();

     var ht = $('#message_right_body').height();

     console.log("Height is ",ht);
     $('.max-message-bottom').css('margin-top',ht);

     $('#message_right_body').hide();
       $('#message_left').addClass('hidden-md');
       $('#message_left').addClass('hidden-sm');
       $('#message_left').addClass('hidden-xs');
       $('#message_right').removeClass('hidden-md');
       $('#message_right').removeClass('hidden-sm');
       $('#message_right').removeClass('hidden-xs');


       sessionStorage.messageState = 2;
       if(w < 600)
       $window.history.pushState(null,'any','advertiser/messages');


       sessionStorage.selectedConversationId = conversation._id;
       $scope.removescrollEvent();
       $scope.selectedConversation = conversation;

       $scope.offset=0;

       console.log('coversation changed');

       console.log("Scroll pos = " + $('#message_right_body').scrollTop());


       $scope.getmessagesRealtedToUser_($rootScope._id,function () {
           $("#message_right_body").fadeIn(100);
           $('.max-message-bottom').css('margin-top',0);
       });

       // $scope.setScrollLast();

      };



            $scope.subcribleUserToMessageSender_ = function(userId) {

                socket.emit('subscribe', userId);
            };

            $scope.unSubcribleUserFromMessageSender_ = function(userId) {
                socket.emit('unsubscribe', userId);
            };

            $scope.sendMessageToReciver_ = function(data) {
                //alert('');
                socket.emit('sendMessageToUser', data);
            };

            $scope.catchMessagesFromSender_ = function() {
                if (!$scope.messageCatchSocketOn) {
                    socket.on('catchMessageFromUsers', function(data) {
                        if (data.statusChanged) {
                            $scope.getConversationsRealtedToUser_($rootScope._id);
                        } else {
                            if (!$scope.messageList) $scope.messageList = [];
                            if(sessionStorage.selectedConversationId === data.conversation)
                                $scope.messageList.push(data);
                            console.log(data);
                            if($scope.conversationList) {
                                for (var i = 0; i < $scope.conversationList.length; i++) {
                                   if($scope.conversationList[i]._id === data.conversation)
                                        $scope.conversationList[i].lastMessage = data.message;
                                }
                            }
                            $scope.$digest();
                            $scope.setScroll(50000);
                        }
                    });
                }
                $scope.messageCatchSocketOn = true;
            };

            $scope.allUserCampaignMessageStatus = function() {
                angular.forEach($scope.messageUserList, function(object) {
                    if (object.campaignId) {
                        var influencerId = ($rootScope._id == object.id1 ? object.id2 : object.id1);
                        advertiser.get({
                            url: 'singleCampaign',
                            id: object.campaignId,
                            influencerId: influencerId,
                            advertiserId: $rootScope._id
                        }).$promise.then(function(data) {
                            object.campaignStatus = data.status;
                            object.appliedCampaignId = data._id;
                            object.price = data.price;
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                    }
                });
            };

            $scope.allUserCampaign = function() {
                angular.forEach($scope.messageUserList, function(object) {
                    if (object.campaignId) {
                        advertiser.get({
                            url: 'campaign',
                            id: object.campaignId
                        }).$promise.then(function(data) {
                            object.campaignTitle = data.campaignTitle;
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                    }
                });
            };

            $scope.sendMessage = function(data) {
                socket.emit('message', data);
                advertiser.save({
                    url: 'sendMessageToInfluencer'
                }, data).$promise.then(function(data) {
                    $scope.getMessageData();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.inviteInfluencerApi = function(object, object1) {
                advertiser.save({
                    url: 'conversation'
                }, object1).$promise.then(function(data) {
                    $scope.inviteSuccessPopUp();
                    object.conversation = data._id;
                    $scope.sendMessageToReciver_(object);
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.endContract = function(id, price,payMethod) {
                $modalStack.dismissAll();
                if(payMethod != 'bank'){
                    var modalInstance = $modal.open({
                        templateUrl: 'modules/users/views/advertiser/popup/influencer.contract.bonus.release.html',
                        size: 'md',
                        windowClass: 'xx-dialog',
                        controller: 'EndContractCtrl',
                        resolve: {
                            price: function() {
                                return price;
                            },
                            conversationId: function() {
                                return id;
                            },
                            payMethod: function() {
                                return payMethod;
                            }
                        }
                    });
                }else{
                    var modalInstance = $modal.open({
                        templateUrl: 'modules/users/views/advertiser/popup/influencer.contract.bank.end.html',
                        size: 'md',
                        windowClass: 'xx-dialog',
                        controller: 'EndContractCtrl',
                        resolve: {
                            price: function() {
                                return price;
                            },
                            conversationId: function() {
                                return id;
                            },
                            payMethod: function() {
                                return payMethod;
                            }
                        }
                    });
                }
            };

            $scope.releasePopup = function(conversationId,payMethod) {
                var object1 = {};
                object1.status = 'completed';
                advertiser.save({
                    url: 'conversation',
                    id: conversationId
                }, object1).$promise.then(function(result) {
                    if(payMethod == 'bank'){
                        $scope.releasePopupSuccessDirect();
                    }
                    else{
                        $scope.releasePopupSuccess();
                    }

                    $scope.getMessageData();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.releasePopupSuccess = function() {
                appModal.modal('modules/users/views/advertiser/popup/influencer.contract.release.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };
            $scope.releasePopupSuccessDirect = function() {
                appModal.modal('modules/users/views/advertiser/popup/influencer.contract.release.direct.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };
            $scope.sendBonus = function(newForm, data, conversationId) {
                if (form.$valid) {
                    var object = {};
                    object.price = data.payment + data.payment * 30 / 100;
                    object.status = 'completed';
                    advertiser.save({
                        url: 'conversation',
                        id: conversationId
                    }, object).$promise.then(function(result) {
                        window.location.href = result.url;
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                } else {
                    return false;
                }
            };
            $scope.viewProfile = function(id) {
                advertiser.get({
                    url: 'influencerData',
                    id: id
                }).$promise.then(function(data) {
                    $scope.singleInfluencerDetails = data;
                    return data;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };


            $scope.updateAdvertiser1 = function(settings) {
                $scope.create = {};
                for (var key in settings) {
                    if (key == '$promise' || key == '$resolved') {} else {
                        $scope.create[key] = settings[key];
                    }
                }
                advertiser.save({
                    url: 'updateAdvertiserOnly',
                    id: $rootScope.email
                }, $scope.create).$promise.then(function(data) {
                    $scope.profileUpdateSuccessPopUp();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.updateAdvertiser = function(settings) {
                $scope.create = {};
                for (var key in settings) {
                    if (key == '$promise' || key == '$resolved') {} else {
                        $scope.create[key] = settings[key];
                    }
                }
                $scope.create.profile = $scope.profile;
                advertiser.save({
                    url: 'updateAdvertiser',
                    id: $rootScope.email
                }, $scope.create).$promise.then(function(data) {
                    $rootScope.email = data.email;
                    $scope.changeLanguage(settings.language);
                    $scope.profileUpdateSuccessPopUp();
                    return false;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.updateAdvertiserPassword = function(settings) {
                if (settings.newPassword !== settings.confirmPassword) {
                    translateGrowl.translateGrowlMessage('ADVERTISER.PASSWORD_NOT_MATCHED', 'error');
                    return false;
                }
                settings.email = $rootScope.email;
                advertiser.save({
                    url: 'updatePassword'
                }, settings).$promise.then(function(data) {
                    if (data.status == "Invalid Username and Password") {
                        translateGrowl.translateGrowlMessage('ADVERTISER.INVALID_OLD_PASSWORD', 'error');
                    } else {
                        $scope.profileUpdateSuccessPopUp();
                        return false;
                    }
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };


            $scope.changeLanguage = function(langKey) {
                $translate.use(langKey);
            };

            $rootScope.$on('$translateChangeSuccess', function(event, data) {
                var language = data.language;
                $rootScope.lang = language;
                $scope.advertiserInfo.language = data.language;
            });

            $scope.initLanguage = function() {
                if ($scope.advertiserInfo.language !== localStorage.NG_TRANSLATE_LANG_KEY) {
                    $scope.changeLanguage($scope.advertiserInfo.language ? $scope.advertiserInfo.language : 'en');
                }
            };

            $scope.profileUpdateSuccessPopUp = function() {
                appModal.modal('modules/users/views/advertiser/popup/advertiser.client.profile.html', 'AdvertiserCtrl', 'md', 'xx-dialog');
            };

            $scope.messageView = function(conversation) {
                $scope.selecteConvesation(conversation);
                $scope.showPage('messagePage');
            };

            $scope.upload = function(file, message, sender, form, campaign, heading, type) {
               /* Upload.upload({
                    url: 'localFileUpload',
                    data: { file: file }
                }).then(function(resp) {
                    form.$valid = true;
                    $scope.sendMessageData(sender, message, form, campaign, resp.data, heading, type);
                }, function(resp) {}, function(evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                });*/


                if (file) {

                     Upload.upload({
                        url: 'imgupload', //webAPI exposed to upload the file
                        headers : {
                            'Content-Type': file.type
                         },
                        data:{file:file} //pass file as data, should be user ng-model
                        }).then(function (resp) { //upload function returns a promise
                            if(resp.data.error_code === 0){ //validate success
                               // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                                form.$valid = true;
                                $scope.sendMessageData(sender, message, form, campaign, resp.data.result.secure_url, heading, type);
                            } else {

                            }
                        }, function (resp) { //catch error
                           /* console.log('Error status: ' + resp.status);
                            $window.alert('Error status: ' + resp.status);*/
                        }, function (evt) {
                         /*   console.log(evt);
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                            vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress*/
                        });

                }
            };
            $scope.getAllCTAs = function() {
                advertiser.getArray({
                    url: 'getAllCTAs',
                    id: $rootScope._id
                }).$promise.then(function(result) {
                    $scope.CTAList = result;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
                
            };

            $scope.loadCreateCTA = function(){
                $state.go('advertiser.createCTA');
            };


            $scope.CTAEnabled=true;
            $scope.CTAName="";
            $scope.actionType="";
            $scope.actionOptions=[{'id' : 1 , 'type' : 'Popup CTA'} , {'id' : 2 , 'type' : 'Footer CTA'} ,{'id':3 ,'type' : 'Bottom Right CTA'}];
            $scope.demoCTATopColor="#F0A150";
            $scope.demoCTABottomColor="#323232";
            $scope.CTATitlePlaceholder="Sample Title";
            $scope.CTAContentPlaceholder="Lorem ipsum dolor sit amet, duo nemore deserunt vulputate ei. Vel nostrum efficiendi ei, in wisi etiam mediocrem sit, stet option invenire no sed. Numquam accusam vis et. Cum no modo delectus definiebas. Integre gubergren deterruisset ne vim, alii consectetuer ius et.";
            $scope.CTAButtonTitle="Subscribe";
            $scope.CTAButtonURL="www.google.com";
            $scope.CTAButtonColor='#3369A6';
            $scope.CTAImageURL="assets/images/mailCTA.png";
            $scope.CTAFieldTitle = "Add Your Email";
            $scope.advId=localStorage.getItem('advertiserId');
            $scope.changeTriggerState=function(){
                $scope.CTAEnabled= !$scope.CTAEnabled;
            }
            $scope.uploadCTAImage = function(file, errFiles) {
                if (errFiles.$error) translateGrowl.translateGrowlMessage('ADVERTISER.FILE_UPLOAD_ERROR_MESSAGE', 'error');
                if (file) {

                     Upload.upload({
                        url: 'imgupload', //webAPI exposed to upload the file
                        headers : {
                            'Content-Type': file.type
                         },
                        data:{file:file} //pass file as data, should be user ng-model
                        }).then(function (resp) { //upload function returns a promise
                            if(resp.data.error_code === 0){ //validate success
                               // $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                                 $scope.CTAImageURL = resp.data.result.secure_url;
                            } else {

                            }
                        }, function (resp) { //catch error
                           /* console.log('Error status: ' + resp.status);
                            $window.alert('Error status: ' + resp.status);*/
                        }, function (evt) {
                         /*   console.log(evt);
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                            vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress*/
                        });

                }
            };
            $scope.conditionOptions=[
                { 
                    'id' :1 ,
                    'option' : 'Device (Smatphone / PC)'
                } ,

                { 
                    'id' : 2 , 
                    'option' : 'Number of Visit'
                } ,

                {  
                    'id' :3 , 
                    'option' : 'Refferal URL'
                } ,

                {
                    'id' : 4 ,
                    'option' : 'Refferal Parameter'
                },

                { 
                    'id' :5 , 
                    'option' : 'Visitor Page'
                } ,

                {
                    'id' : 6 ,
                    'option' : 'Visitor Page Count'
                },

                {
                    'id' :7 ,
                    'option':'Schedule (Date , Time)' 
                } ,

                {
                    'id' : 8 ,
                    'option' : 'Visitor Time on Page'
                } ,

                {
                    'id' : 9 ,
                    'option' : 'Visitor Time on Site'
                } ,

                {
                    'id' : 10 ,
                    'option' : 'Visitor Scrolled on site'
                },
                {
                    'id': 11 ,
                    'option' : 'Visitor Tag'
                }
            ];

            $scope.CTAConditions =[{'id' : 1 , 'options' : angular.copy($scope.conditionOptions)}];
            
            $scope.addNewCondition = function() {
                var newItemNo = $scope.CTAConditions.length+1;
                $scope.CTAConditions.push({
                    'id':newItemNo ,
                    'options' : angular.copy($scope.availableOptions)
                });
              
            };

            $scope.optionSelected=function(choice){

                var availableOptions = [];

                $scope.availableOptions = $scope.availableOptions || angular.copy($scope.conditionOptions);

                if(choice.selectedConditon){
                    var index =-1;
                    angular.forEach($scope.availableOptions , function(item ,i){
                        if(item.id === choice.selectedConditon.id)
                            index=i;
                    });

                    if(index > -1){
                        $scope.availableOptions.splice(index ,1);
                    }
                }

            };
            $scope.removeCondition=function(choice ,index){

                if(choice.selectedConditon){
                    $scope.availableOptions.push(choice.selectedConditon);
                    $scope.CTAConditions.splice(index ,1);
                }
                
            };
            $scope.saveCTA = function(form , conditions){
                if(form.$valid){
                   

                    //conditions object

                    $scope.tempCon={
                        device : "",
                        numberOfVisit : "",
                        refURL : "",
                        refeParameter : "" ,
                        visitorPage : " ",
                        visitorPageCount : "0",
                        schedule : new Date() ,
                        visitorTimeOnPage: "0",
                        visitorTimeOnSite:"0",
                        VisitorScrolled : true ,
                        visitorTag:""

                    }
                  
                    angular.forEach(conditions ,function(data , index){
                        switch(data.selectedConditon.id){

                            case 1 : $scope.tempCon.device=data.value;
                                        
                                        break;
                            case 2 : $scope.tempCon.numberOfVisit=data.value;
                                        
                                        break;
                            case 3 : $scope.tempCon.refURL=data.value;
                                        
                                        break;
                            case 4 : $scope.tempCon.refeParameter=data.value;
                                        
                                        break;
                            case 5 : $scope.tempCon.visitorPage=data.value;
                                        
                                        break;
                            case 6 : $scope.tempCon.visitorPageCount=data.value;
                                        
                                        break;
                            case 7 : $scope.tempCon.schedule=data.value;
                                        
                                        break;
                            case 8 : $scope.tempCon.visitorTimeOnPage=data.value;
                                        
                                        break;
                            case 9 : $scope.tempCon.visitorTimeOnSite=data.value;
                                        
                                        break;
                            case 10 : $scope.tempCon.VisitorScrolled=data.value;
                                        
                                        break;
                            case 11 : $scope.tempCon.visitorTag=data.value;
                                        
                        }


                    });
               
                     $scope.CTAdata={};
                    $scope.CTAdata.CTATitle=form.CTAName.$modelValue;
                    $scope.CTAdata.CTATriggerStatus=$scope.CTAEnabled;
                    $scope.CTAdata.CTAActionType=form.CTAActionType.type;
                    $scope.CTAdata.CTAColorTop=form.CTA_top_color.$modelValue;
                    $scope.CTAdata.CTAColorBottom=form.CTA_bottom_color.$modelValue;
                    $scope.CTAdata.CTAShowTitle=form.CTA_title.$modelValue;
                    $scope.CTAdata.CTAShowContent=form.CTA_content.$modelValue;
                    $scope.CTAdata.CTAFiledName=form.CTA_fieldName.$modelValue;
                    $scope.CTAdata.CTAButtonType="none";
                    $scope.CTAdata.CTAButtonColor=form.CTA_button_color.$modelValue;
                    $scope.CTAdata.CTAButtonName=form.CTA_button_name.$modelValue;
                    $scope.CTAdata.CTAButtonURL=form.CTA_button_url.$modelValue;
                    $scope.CTAdata.CTAAdvertiserId=$scope.advId;
                    $scope.CTAdata.CTAConditions = $scope.tempCon;
                    $scope.CTAdata.CTAImageURL = $scope.CTAImageURL;

                    advertiser.save({
                        url: 'cta'
                    }, $scope.CTAdata).$promise.then(function(result) {
                       showPage('cta','list');
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
                    
                }
            };
            

            //$scope.credentialFunc();
            
            
        }
    ]);
    angular.module('users').run(['$rootScope', function($rootScope) {
        $rootScope.search_icon = true;
    }]);
}());
