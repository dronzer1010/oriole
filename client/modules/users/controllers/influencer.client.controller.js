(function() {
    'use strict';
    angular.module('users').controller('InfluencerCtrl', ['$location', '$http','$scope', 'Authentication', '$state', 'influencer',
        '$modal', '$rootScope', 'Upload', '$timeout', 'categoryService',
        '$modalStack', 'instagramMedia', '$translate', 'advertiser', 'ENV',
        'translateGrowl', 'appModal', '$window', 'dateselector',
        function($location,$http, $scope, Authentication, $state, influencer,
            $modal, $rootScope, Upload, $timeout, categoryService,
            $modalStack, instagramMedia, $translate, advertiser, ENV, translateGrowl, appModal, $window, dateselector) {

            $scope.glued = true;
            $scope.searchCollapsed = true;
            $rootScope.env = ENV;

            $scope.months = dateselector.months();
            $scope.years = dateselector.years();

            if ($window.sessionStorage.getItem('isCham') === 'false') {
                $rootScope.influ_Cham = false;
            }
            $scope.show_influ_Cham = function() {
                $window.sessionStorage.setItem('isCham', true);
                $rootScope.influ_Cham = true;
            };
            $scope.hide_influ_Cham = function() {
                    $window.sessionStorage.setItem('isCham', false);
                    $rootScope.influ_Cham = false;
            }
                // go toggle
            $scope.toggles = [
                { value: 0, name: 'PROFILE_MENU.LIST_1' },
                { value: 1, name: 'PROFILE_MENU.LIST_2' },
                { value: 2, name: 'PROFILE_MENU.LIST_3' },
                { value: 3, name: 'PROFILE_MENU.LIST_4' },
                { value: 4, name: 'PROFILE_MENU.LIST_5' },
                { value: 5, name: 'PROFILE_MENU.LIST_6' }
            ]

            if ($window.sessionStorage.getItem('currentToggle')) {
                $scope.toggle = parseInt($window.sessionStorage.getItem('currentToggle'));
            } else {
                $scope.toggle = 0
            }

            $scope.goToggle = function(toggle) {
                $window.sessionStorage.setItem('currentToggle', toggle);
                switch (toggle) {
                    case 0:
                        $state.go('influencer.profile.aboutMe');
                        break;

                    case 1:
                        $state.go('influencer.profile.payment');
                        break;

                    case 2:
                        $state.go('influencer.profile.photo');
                        break;

                    case 3:
                        $state.go('influencer.profile.notificationSetting');
                        break;

                    case 4:
                        $state.go('influencer.profile.langugae');
                        break;

                    case 5:
                        $state.go('influencer.profile.terms');
                        break;
                }
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
            }

            $scope.applyInfluencerFilter = function(searchCriteria) {
                $scope.filterObject = {};

                if (searchCriteria.male) {
                    $scope.filterObject.male = searchCriteria.male;
                } else {
                    $scope.filterObject.male = undefined;
                }

                if (searchCriteria.female) {
                    $scope.filterObject.female = searchCriteria.female;
                } else {
                    $scope.filterObject.female = undefined;
                }
                $scope.filterObject.minAge = 18;

                $scope.filterObject.maxAge = 50;
                $scope.filterObject.maxAgePlus = 50;

                $scope.filterObject.minPrice = 100;
                $scope.filterObject.maxPrice = 1000;
                $scope.filterObject.campaignCategory = undefined;
                $scope.filterObject.chosenPlace = undefined;
                if (searchCriteria.age != undefined) {
                    $scope.filterObject.minAge = searchCriteria.age[0];
                    $scope.filterObject.maxAge = searchCriteria.age[1];
                    $scope.filterObject.maxAgePlus = searchCriteria.age[1];
                }

                if (searchCriteria.price != undefined) {
                    $scope.filterObject.minPrice = searchCriteria.price[0];
                    $scope.filterObject.maxPrice = searchCriteria.price[1];
                }
                if (searchCriteria.campaignCategory != undefined) {
                   
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
                if (searchCriteria.chosenPlace != undefined) {
                    $scope.filterObject.chosenPlace = searchCriteria.chosenPlace;
                }
                $scope.getCampaignData();
            }

            $scope.collapseSearch = function() {
                $scope.searchCollapsed = !$scope.searchCollapsed;
                $scope.navCollapsed = true;
            };

            $scope.navCollapsed = true;
            $scope.collapseNav = function() {
                $scope.navCollapsed = !$scope.navCollapsed;
                $scope.searchCollapsed = true;
                // console.log('close toggle-->', $scope.navCollapsed)
                $scope.flag = true;
            };

            $scope.close_toggle = function() {
                if ($scope.flag == false) {
                    // console.log('close toggle', $scope.navCollapsed);
                    if ($scope.navCollapsed == false) {
                        $scope.navCollapsed = true;
                    }
                }
                $scope.flag = false;
            }

            $scope.instagramProfile = function() {
                influencer.get({ url: 'getInstagramProfile' }).$promise.then(function(data) {
                    if (typeof(data) != 'undefined') {
                        if (!$scope.profilePhoto) { $scope.profilePhoto = data.profile_picture; }
                    }
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.sendBtn = function($event) {
                // console.log('send test')
                if($event) $event.preventDefault();
                var textmsg = $('#chat_text_area').val();
                if(textmsg != '') {
                    // console.log("SENT : " + $scope.selectedConversation.influencerId._id + " " + textmsg + " " + $scope.selectedConversation._id);
                    $scope.sendMessageData($scope.selectedConversation.influencerId._id, textmsg, 'msg*from*checkIfEnterKeyWasPressed', $scope.selectedConversation._id, '', '', 'normal');
                    $('#chat_text_area').val('');
                    $scope.setScrollLast();
                }

                // console.log('element', message_body)
            };
            $scope.checkIfEnterKeyWasPressed = function($event) {
                if($event.keyCode === 13 && !$event.shiftKey){
                    if($event) $event.preventDefault();
                    var textmsg = $('#chat_text_area').val();
                    if(textmsg != '') {
                        // console.log("SENT : " + $scope.selectedConversation.influencerId._id + " " + textmsg + " " + $scope.selectedConversation._id);
                        $scope.sendMessageData($scope.selectedConversation.influencerId._id, textmsg, 'msg*from*checkIfEnterKeyWasPressed', $scope.selectedConversation._id, '', '', 'normal');
                        $scope.sendMessageData($scope.selectedConversation.advertiserId._id, textmsg, 'msg*from*checkIfEnterKeyWasPressed', '', '', '', 'normal', $scope.selectedConversation._id)
                        $('#chat_text_area').val('');
                        $scope.setScrollLast();
                    }
                }
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

            $scope.load = function() {
                influencer.get({ url: 'credential' }).$promise.then(function(data) {

                    if (data.influencer) {
                        //$rootScope._id = data.passport.user._id;
                        $rootScope.influencer = "influencer";
                        $rootScope.accesstoken = data.influencer.accessToken;
                        $rootScope.instagramId = data.influencer.id;


                        if ($state.current.name === 'influencer.profile.aboutMe') {

                            $scope.influencerExist();
                        } else if ($state.current.name === 'influencer.profile.photo') {
                            $state.go($state.current.name);
                            $scope.getProfileData();
                        } else if ($state.current.name === 'influencer.profile.payment') {
                            $state.go($state.current.name);
                            $scope.getProfileData();
                        } else if ($state.current.name === 'influencer.profile.notificationSetting') {
                            $state.go($state.current.name);
                            $scope.getProfileData();
                        } else if ($state.current.name === 'influencer.profile.langugae') {
                            $state.go($state.current.name);
                            $scope.getProfileData();
                        } else if ($state.current.name === 'influencer.campaign') {
                            $state.go($state.current.name);
                            $scope.influencerExist("campaign");
                        } else if ($state.current.name === 'influencer.campaign.details') {
                            $state.go($state.current.name);
                        } else if ($state.current.name === 'influencer.bookmarks') {
                            $state.go($state.current.name);
                            $scope.influencerExist('mybookmarks');
                        } else if ($state.current.name === 'influencer.myCampaign') {
                            $state.go($state.current.name);
                            $scope.influencerExist('mycampaign');
                        } else if ($state.current.name === 'influencer.message') {
                            $state.go($state.current.name);
                            $scope.getProfileData("message");
                        } else if ($state.current.name === 'influencer.analytics') {

                            $scope.getProfileData();
                        } else if ($state.current.name === 'influencer.instagrammers') {
                            $state.go($state.current.name);
                            $scope.influencerExist();
                        } else {
                            if ($rootScope.env == 'block') {
                                $state.go("influencer.profile.aboutMe");
                                $scope.influencerExist();
                            } else {
                                $state.go('influencer.campaign');
                                $scope.influencerExist("campaign");
                            }
                        }
                    } else {
                        $scope.logout();
                    }
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $rootScope.categoryData = [];
            $scope.categoryPopup = function(categoriesValue) {
                $rootScope.categoriesValue = categoriesValue;
                appModal.modal('modules/users/views/influencer/popup/category.html', 'InfluencerCtrl', 'md', 'xx-dialog');
            };

            $scope.catgeoryArray = function(object) {
                if ($rootScope.categoryData.indexOf(object) == -1) {
                    if ($rootScope.categoryData.length < 3) {
                        $rootScope.categoryData.push(object);
                    } else {
                        translateGrowl.translateGrowlMessage('INFLUENCER.THREE_CATEGORY_ALLOW', 'error');
                        $modalStack.dismissAll();
                    }
                } else {
                    var index = $rootScope.categoryData.indexOf(object);
                    $rootScope.categoryData.splice(index, 1);
                }
                $rootScope.categoryData = $scope.arrayToString($rootScope.categoryData);
            };
            $scope.arrayToString = function(string) {
                return string.join(",");
            };
            $scope.checkCategory = function(object) {
                if ($rootScope.categoriesValue) {
                    $rootScope.categoryData = $rootScope.categoriesValue;
                }
                var ifExist = false;
                angular.forEach($rootScope.categoryData, function(data) {
                    if (data.trim() == object) { ifExist = true; }
                });
                return ifExist;
            };
            $scope.submitAboutMe = function(data, form, profilePhoto) {

                if (form.$valid) {
                    data.category = $rootScope.categoryData;
                    $scope.profileDetails = {};
                    $scope.profileDetails.instagramId = $rootScope.instagramId;
                    $scope.profileDetails.accesstoken = $rootScope.accesstoken;
                    $scope.profileDetails.aboutMe = data;
                    $scope.profileDetails.language = localStorage.NG_TRANSLATE_LANG_KEY;
                    $scope.profileDetails.preferredLanguage = 'en';
                    $scope.profileDetails.status = 'Verified';
                    $scope.profileDetails.aboutMe.birthday = new Date($scope.months[data.month].name + " 15" + "," + data.year);
                    $scope.profileDetails.profilePhoto = profilePhoto;
                    if ($scope.aboutMe) {
                        $scope.updateInfluencer("aboutMe", "photo");
                    } else {
                        $scope.createInfluencer("photo");
                    }
                } else {
                    return false;
                }
            };

            $scope.createInfluencer = function(nextPage) {
                influencer.save({ url: 'influencer' }, $scope.profileDetails).$promise.then(function(data) {
                    translateGrowl.translateGrowlMessage('INFLUENCER.ABOUT_ME_ADDED_SUCCESSFULLY', 'success');
                    $scope.getProfileData();
                    $scope.firstTimeLogging = false;
                    $state.go('influencer.profile.' + nextPage);
                    $scope.profilePage = nextPage;
                    $scope.profileDetails = {};
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.removePhoto = function(index) {
                $scope.photoList.splice(index, 1);
            };
            $scope.removePhotoLocal = function(index) {
                $scope.localPhotoList.splice(index, 1);
            };
            $scope.removePhotoAWS = function(index) {
                $scope.photos.splice(index, 1);
            };
            $scope.localPhotoList = [];
            $scope.upload = function(file) {
                var obj = {};
                obj.thumbnail = file.$ngfBlobUrl;
                $scope.localPhotoList.push(obj);
            };

            $scope.showAddPhotoDialog = function(ev) {
                $rootScope.r_noOfSelectImages = $scope.instagramSavedPhotoList ? $scope.instagramSavedPhotoList.length : 0;
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/influencer/popup/editProfile.instagram.pickImage.html',
                    size: 'lg',
                    windowClass: 'xx-dialog',
                    controller: 'InfluencerCtrl'
                });

                modalInstance.result.then(function(success) {}, function() {
                    if ($rootScope.refresh) {
                        $rootScope.refresh = false;
                        $scope.updateInstagramPhotos();
                        $state.reload();
                    }
                });
            };
            $scope.instagramNotsavedPhotoList = [];
            var validateExist = function(media) {
                for (var i = 0; i < $scope.instagramNotsavedPhotoList.length; i++) {
                    if (media.id == $scope.instagramNotsavedPhotoList[i].mediaId) {
                        return true;
                    }
                }
                return false;
            };


            $scope.getInstagramRecentPhotoNotSaved = function() {

               /* if ($scope.clickedImages_temp) {
                    $rootScope.clickedImages = $scope.clickedImages_temp;
                }*/
                if(!$scope.clickedImages_temp){
                    if ($rootScope.clickedImages)
                        $scope.clickedImages_temp = JSON.parse(JSON.stringify($rootScope.clickedImages));
                    else
                        $scope.clickedImages_temp = [];
                }

                if ($rootScope.removingMediaList) {
                    $scope.removingMediaList_temp = JSON.parse(JSON.stringify($rootScope.removingMediaList));
                    // $scope.removingMediaList_update =  JSON.parse(JSON.stringify($rootScope.removingMediaList));
                } else {
                    $scope.removingMediaList_temp = [];
                    //$scope.removingMediaList_update = [];
                }
                $scope.noOfSelectImages = $rootScope.r_noOfSelectImages;
                $scope.noOfSelectImages = $scope.noOfSelectImages + $scope.clickedImages_temp.length;
                instagramMedia.get({ url: 'getInstagramRecentMediaNotSaved', max_id: $scope.max_id })
                    .$promise.then(function(data) {
                        var medias = data.medias;
                        $scope.max_id = data.max_id;
                        angular.forEach(medias, function(object, index) {
                            if (!validateExist(object)) {
                                var obj = {};
                                obj.instagramId = $rootScope.instagramId;
                                obj.images = {};
                                obj.images.low_resolution = object.images.low_resolution.url;
                                obj.images.thumbnail = object.images.thumbnail.url;
                                obj.images.standard_resolution = object.images.standard_resolution.url;
                                obj.count = object.likes.count;
                                obj.mediaId = object.id;
                                if (_.findIndex($scope.clickedImages_temp, { 'mediaId': object.id }) == -1) {
                                    $scope.instagramNotsavedPhotoList.push(obj);
                                }
                            }
                        });
                    }).catch(function(error) {
                        console.log("error", error);
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
            };


            $scope.changeRemoveImageStates = function(photo, $index) {
                if (!photo.checked) {
                    photo.checked = true;
                    $scope.noOfSelectImages++;
                } else {
                    photo.checked = false;
                    $scope.noOfSelectImages--;
                }
            };

            $scope.getSavedIntagramPhotos = function() {
                $scope.instagramSavedPhotoList = [];
                instagramMedia.getArray({ url: 'getInstagramMediaByInstagramId', id: $rootScope.instagramId })
                    .$promise.then(function(data) {
                        $scope.instagramSavedPhotoList = [];
                        angular.forEach(data, function(object, index) {
                            if ($rootScope.removingMediaList) {
                                if (_.findIndex($rootScope.removingMediaList, { 'mediaId': object.mediaId }) == -1) {
                                    $scope.instagramSavedPhotoList.push(object);
                                }
                            } else {
                                $scope.instagramSavedPhotoList.push(object);
                            }
                        });
                        $rootScope.r_noOfSelectImages = $scope.instagramSavedPhotoList.length;
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
            };

            $scope.saveInstagramPhotoListChanges = function(removedPhotoList, addPhotoList) {
                if (removedPhotoList) {
                    instagramMedia.save({ url: 'removeInstagramMediaList' }, removedPhotoList)
                        .$promise.then(function(data) {
                            $rootScope.removingMediaList = [];
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_PHOTO_UPDATED_MESSAGE', 'success');
                            $state.reload();
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                }
                if (addPhotoList) {
                    instagramMedia.save({ url: 'instertInstagramMediaList' }, addPhotoList)
                        .$promise.then(function(data) {
                            $rootScope.clickedImages = [];
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_PHOTO_UPDATED_MESSAGE', 'success');
                            $state.reload();
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
                }
            };

            $scope.clickedOnPhotos = function(photo, $index) {
                if (photo.checked == 'true') {
                        photo.checked = false;
                        $scope.clickedImages_temp.splice(photo.selectIndex, 1);
                        $scope.noOfSelectImages--;
                }
                if ($scope.noOfSelectImages == 30 && !photo.checked) {
                    translateGrowl.translateGrowlMessage('Please remove the added photos to add new one.', 'error');
                    return;
                }
                if (!photo.checked) {
                    photo.checked = true;
                    if (!$scope.clickedImages_temp) $scope.clickedImages_temp = [];
                    photo.selectIndex = $scope.clickedImages_temp.length;
                    $scope.clickedImages_temp.push(photo);
                    $scope.noOfSelectImages++;
                } else {
                    if (photo.checked) {
                        photo.checked = false;
                        $scope.clickedImages_temp.splice(photo.selectIndex, 1);
                        $scope.noOfSelectImages--;
                    }
                }
            };

            $scope.updateInstagramPhotos = function() {
                $rootScope.refresh = true;
                if ($scope.clickedImages_temp) {
                    $rootScope.clickedImages = $scope.clickedImages_temp;
                }
                if ($scope.removingMediaList_temp) {
                    var removeElement = 0;
                    for (var i = 0; i < $scope.removingMediaList_temp.length; i++) {
                        if ($scope.removingMediaList_temp[i].checked) {
                            $rootScope.removingMediaList.splice(i - removeElement, 1);
                            removeElement++;
                        }
                    }
                }
                $modalStack.dismissAll();
            };

            $scope.addToRemoveList = function(media, $index) {
                if (!$rootScope.removingMediaList) {
                    $rootScope.removingMediaList = [];
                }
                $scope.instagramSavedPhotoList.splice($index, 1);
                $rootScope.removingMediaList.push(media);
            };
            $scope.removeFromSeletedList = function(media, $index) {
                $rootScope.clickedImages.splice($index, 1);
            };
            $scope.savePaypalSetting = function(paypalsettingform, paypalsetting) {
                if (paypalsettingform.$valid) {
                    $scope.profileDetails = {};
                    $scope.profileDetails.paypalSetting = paypalsetting;
                    $scope.updateInfluencer("PaypalEmailSetting", "payment");
                }
            };
            $scope.paypalEmailPopup = function(closeble, influencerId, paypalSetting) {
                $rootScope.paypalEmailPopupNeedToOpen = false;
                var paypalEmail;
                var emailRequested;
                if (paypalSetting) {
                    paypalEmail = paypalSetting.paypalEmail;
                    emailRequested = paypalSetting.emailRequested;
                }
                if (!$rootScope.paypalEmailPopupAlreadyOpen) {
                    $rootScope.paypalEmailPopupAlreadyOpen = true;
                    if (!paypalEmail && emailRequested) {
                        $rootScope.paypalEmailPopupNeedToOpen = true;
                    }
                } else if ($state.current.name === 'influencer.message') {
                    if (!$rootScope.messageViewAllow) {
                        if (!paypalEmail && emailRequested) {
                            $rootScope.paypalEmailPopupNeedToOpen = true;
                        }
                        $rootScope.messageViewAllow = true;
                    }
                }
                if ($rootScope.paypalEmailPopupNeedToOpen) {
                    if ($state.current.name === 'influencer.message') {
                        closeble = false;
                    }
                    var modalInstance = $modal.open({
                        templateUrl: 'modules/users/views/influencer/popup/influencer.client.paypal.email.html',
                        size: 'md',
                        windowClass: 'xx-dialog',
                        controller: 'InfluencerCtrl',
                        resolve: {
                            influencerId: function() {
                                return $scope.influencerId;
                            }
                        },
                        backdrop: closeble,
                        keyboard: closeble
                    });
                    modalInstance.result.then(function() {
                        return false;
                    });
                }
            };


            $scope.termsAndConditionCheckPopup = function() {
                $modalStack.dismissAll();
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/shared/termsandservice.dialog.html',
                    size: 'md',
                    windowClass: 'xx-dialog',
                    controller: 'TermsAndConditionCtrl',
                    resolve: {
                        instagramId: function() {
                            return $rootScope.instagramId;
                        },
                        advertiserId: function() {
                            return null;
                        }
                    },
                    backdrop: false,
                    keyboard: false

                });
                modalInstance.result.then(function() {
                    $rootScope.status = "Verified";
                    //on ok button press
                }, function() {
                    //on cancel button press
                });
            };

            $scope.savePaypalEmail = function(paypalsettingForm, paypalsetting) {
                if (paypalsettingForm.$valid) {
                    //$scope.profileDetails['paypalSetting'] = paypalsetting;
                    influencer.save({ url: 'influencer', id: $rootScope.instagramId }, paypalsetting)
                        .$promise.then(function(data) {
                            $modalStack.dismissAll();
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_PAYPAL_EMAIL_UPDATED', 'success');
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });

                }
            };
            $scope.submitNotificationSetting = function(data) {
                $scope.profileDetails = {};
                $scope.profileDetails.notificationSetting = data;
                $scope.updateInfluencer("notification", 'notificationSetting');
            };
            $scope.changeLanguage = function(langKey) {
                $translate.use(langKey);
            };
            $rootScope.$on('$translateChangeSuccess', function(event, data) {
                var language = data.language;
                $rootScope.lang = language;
            });
            $scope.initLanguage = function() {
                if ($scope.language.language !== localStorage.NG_TRANSLATE_LANG_KEY) {
                    $scope.changeLanguage($scope.language.language ? $scope.language.language : 'en');
                }
                $scope.language = {
                    language: $scope.language.language ? $scope.language.language : 'en',
                    preferredLanguage: $scope.language.preferredLanguage ? $scope.language.preferredLanguage : 'en',
                    preferredTimezone: $scope.language.preferredTimezone
                };
            };
            $scope.submitLangugae = function(data) {
                $scope.profileDetails = {};
                $scope.profileDetails.language = data.language;
                $scope.profileDetails.preferredTimezone = data.preferredTimezone;
                $scope.profileDetails.preferredLanguage = data.preferredLanguage;
                $state.go('influencer.profile.langugae');
                $scope.updateInfluencer("langugae", 'langugae');
            };

            $scope.updateInfluencer = function(currentPage, nextPage) {
                influencer.save({ url: 'influencer', id: $rootScope.instagramId }, $scope.profileDetails).$promise.then(function(data) {
                    $scope.profileDetails = {};
                    if ($scope.firstTimeLogging === true) {
                        $scope.firstTimeLogging = false;
                        $state.go('influencer.profile.' + nextPage);
                        $scope.profile = nextPage;
                        if (currentPage == 'langugae') {
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_LANGUAGE_UPDATED', 'success');
                        }
                        if (currentPage == 'notification') {
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_NOTIFICATION_UPDATED', 'success');
                        }
                        if (currentPage == 'PaypalEmailSetting') {
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_PAYPAL_EMAIL_UPDATED', 'success');
                        }
                    } else {
                        if (currentPage == 'aboutMe') {
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_UPDATED', 'success');
                        }
                        if (currentPage == 'PaypalEmailSetting') {
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_PAYPAL_EMAIL_UPDATED', 'success');
                        }
                        if (currentPage == 'notification') {
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_NOTIFICATION_UPDATED', 'success');
                        }
                        if (currentPage == 'langugae') {
                            translateGrowl.translateGrowlMessage('PROFILE_PAGE_ABOUTME.ABOUT_ME_LANGUAGE_UPDATED', 'success');
                        }
                        return false;
                    }

                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.logout = function() {
                influencer.get({ url: 'logout' }).$promise.then(function(data) {
                    $rootScope.status = null;
                    $state.go('home');
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };


            $scope.messageView = function(conversation) {
                $scope.selecteConvesation(conversation);
                $scope.influencerExist('message');
            };
            $scope.bookmarkedCampaignData = function(id) {
                influencer.getArray({ url: 'campaignBookmark', id: id }).$promise.then(function(data) {
                    $scope.bookmarkedCampaignList = data;

                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };
            $scope.checkBookmarkedCampaign = function(campaignId) {
                var ifExist = false;
                angular.forEach($scope.bookmarkedCampaignList, function(data) {
                    if (data.campaignId) {
                        if (data.campaignId._id == campaignId) ifExist = true;
                    }
                });
                return ifExist;
            };

            $scope.checkAppliedCampaign = function(campaignId) {
                var ifExist = false;
                angular.forEach($scope.appliedCampaignList, function(data) {

                    if (data.campaignId && data.campaignId._id == campaignId) ifExist = true;
                });
                return ifExist;
            };
            $scope.getCampaignData = function(pageNumber) {
                if (pageNumber == undefined) {
                    pageNumber = 1;
                }

                $scope.categories = categoryService;
                influencer.getArray({
                    url: 'showCampaign',
                    id: pageNumber,
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
                }).$promise.then(function(data) {
                    $scope.bookmarkedCampaignData($rootScope._id);
                    $scope.totalPages = data.pop();
                    $scope.campaignData = data;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };
            $scope.applyCampaignFunc = function(campaignId) {
                //$scope.getProfileData();
                $scope.minPricePop = "Your Price ($" + $scope.aboutMe.minPrice + ")";
                $scope.applyCampaignPop(campaignId);
            };
            $scope.applyCampaignPop = function(campaignId) {
                $modalStack.dismissAll();
                var modalInstance = $modal.open({
                    templateUrl: 'modules/users/views/influencer/popup/influencer.client.campaign.apply.html',
                    size: 'md',
                    controller: 'ApplyCampaignCtrl',
                    windowClass: 'xx-dialog',
                    scope: $scope,
                    resolve: {
                        campaignData: function() {
                            return $scope.campaignData;
                        },
                        campaignId: function() {
                            return campaignId;
                        },
                        influencer: function() {
                            return $scope.minPricePop;
                        }
                    }
                });
                modalInstance.result.then(function() {
                    return false;
                });
            };
            $scope.sendCampaign = function(form, applyCampaign, singleCampaign) {
                if (form.$valid) {
                    advertiser.get({
                            url: "singleConversation",
                            campaignId: singleCampaign._id,
                            influencerId: $rootScope._id,
                            advertiserId: singleCampaign.advertiserId
                        })
                        .$promise.then(function(result) {
                            if (result._id) {
                                $scope.alreadyExist = true;
                                return false;
                            }
                            var object = {};
                            object.recipient = singleCampaign.advertiserId;
                            object.sender = $rootScope._id;
                            object.message = applyCampaign.message;
                            object.campaign = singleCampaign._id;
                            object.type = "normal";
                            object.statusChanged = true;
                            var object1 = {};
                            object1.influencerId = $rootScope._id;
                            object1.campaignId = singleCampaign._id;
                            object1.advertiserId = singleCampaign.advertiserId;
                            object1.message = applyCampaign.message;
                            object1.status = "applied";
                            object1.price = $scope.aboutMe.minPrice;
                            $scope.applyCampaignApi(object, object1);
                        }).catch(function(error) {
                            translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                        });
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

                       if (typeof callback === "function")
                           callback();
                   }
                   else {
                       console.log('3. offset in else = '+$scope.offset);
                       if(response.data.length === 0) $scope.setScroll(5);
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
                   //console.log($scope.messageList);
                   setTimeout(function() {
                       $scope.scrollCheck();
                   }, 500);

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

                $scope.onMessageBody = true;

                sessionStorage.messageState = 2;
                if(w < 600)
                    $window.history.pushState(null,'any','influencer/messages');

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
                console.log("sendMessageToReciver_", data);
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

            $scope.applyCampaignApi = function(object, object1) {
                influencer.save({ url: 'conversation' }, object1).$promise.then(function(data) {
                    object.conversation = data._id;
                    if (data.message == "data already exist") {
                        $scope.campaignAlreadyAppliedPopUp();
                        return false;
                    } else {
                        $scope.emailUpdate(object, object1.advertiserId, data);
                        return false;
                    }
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.emailUpdate = function(object, advertiserId, data) {
                influencer.get({ url: 'advertiserEmail', id: advertiserId }).$promise.then(function(result) {
                    $scope.campaignSuccessPopUp();
                    $scope.sendMessageToReciver_(object);
                    $state.go('influencer.campaign', {}, { reload: true });
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.campaignSuccessPopUp = function() {
                appModal.modal('modules/users/views/influencer/popup/campaign.applied.html', 'InfluencerCtrl', 'md', 'xx-dialog');
            };
            $scope.campaignAlreadyAppliedPopUp = function() {
                appModal.modal('modules/users/views/influencer/popup/campaign.already.applied.html', 'InfluencerCtrl', 'md', 'xx-dialog');
            };
            $scope.bookmarkCampaignFunc = function(campaignId, checked) {
                var obj = {};
                obj.campaignId = campaignId;
                obj.influencerId = $rootScope._id;
                influencer.save({ url: 'campaignBookmark' }, obj).$promise.then(function(data) {
                    if (data.message == "campaign unbookmarked") {
                        $scope.UnbookmarkSuccessPopUp();
                        $(".bookmark_" + campaignId).attr('style', 'display:none !important');
                        $(".unbookmark_" + campaignId).attr('style', 'display:block !important');

                    } else {

                        $scope.bookmarkSuccessPopUp();
                        $(".unbookmark_" + campaignId).attr('style', 'display:none !important');
                        $(".bookmark_" + campaignId).attr('style', 'display:block !important');

                    }


                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };
            $scope.bookmarkSuccessPopUp = function() {
                appModal.modal('modules/users/views/influencer/popup/campaign.bookmark.html', 'InfluencerCtrl', 'md', 'xx-dialog');
            };
            $scope.UnbookmarkSuccessPopUp = function() {
                appModal.modal('modules/users/views/influencer/popup/campaign.unBookmark.html', 'InfluencerCtrl', 'md', 'xx-dialog');
            };
            $scope.getMyCampaignData = function(id) {
                influencer.getArray({ url: 'myCampaign', id: id }).$promise.then(function(data) {
                    $scope.myCampaignData = data;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.isActive1 = function(item) {
                if (sessionStorage.selectedConversationId == item._id) {
                    $scope.selectedConversation = item;
                    return true;
                }
                return false;
            };

            $scope.viewCampaign = function() {
                influencer.get({ url: 'campaign', id: $state.params.campaignId }).$promise.then(function(data) {
                    $scope.singleCampaignDetails = data;
                }).catch(function(error) {
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };

            $scope.sendMessageData = function(recipient, message, form, campaign, fileLink, heading, type, conversationId, statusChanged) {
                if(form === 'msg*from*checkIfEnterKeyWasPressed'){
                    var object = {};
                    object.recipient = recipient;
                    object.recipientType = 'Advertiser';
                    object.sender = $rootScope._id;
                    object.message = message;
                    object.conversation = conversationId;
                    object.fileLink = fileLink;
                    object.heading = heading;
                    object.type = type;
                    object.statusChanged = statusChanged;
                    // form.$valid = false;
                    $scope.sendMessageToReciver_(object);
                }
                else if (form.$valid) {
                    var object = {};
                    object.recipient = recipient;
                    object.recipientType = 'Advertiser';
                    object.sender = $rootScope._id;
                    object.message = message;
                    object.conversation = conversationId;
                    object.fileLink = fileLink;
                    object.heading = heading;
                    object.type = type;
                    object.statusChanged = statusChanged;
                    form.$valid = false;
                    $scope.sendMessageToReciver_(object);
                } else {
                    return false;
                }
            };

            var barGraphAnalytics = function(hourArray, postsHourlyCountArray, avgLikesCountArray) {
                $translate('ANALYTICS.POSTING_ANALYTICS_LABEL')
                        .then(function (translatedValue) {
                        $scope.postingAnalytics = translatedValue;
                });
                $('#container').highcharts({
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        text: $scope.postingAnalytics
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: [{
                        categories: hourArray,
                        crosshair: true
                    }],
                    yAxis: [{ // Primary yAxis
                        labels: {
                            format: '{value}',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        title: {
                            text: $scope.avgLikesLabel,
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        }
                    }, { // Secondary yAxis
                        title: {
                            text: $scope.totalPostsLabel,
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            format: '{value}',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        opposite: true
                    }],
                    tooltip: {
                        shared: true
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 120,
                        verticalAlign: 'top',
                        y: 100,
                        floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        name: $scope.totalPostsLabel,
                        type: 'column',
                        yAxis: 1,
                        data: postsHourlyCountArray,
                        tooltip: {
                            valueSuffix: ''
                        }

                    }, {
                        name: $scope.avgLikesLabel,
                        type: 'spline',
                        data: avgLikesCountArray,
                        tooltip: {
                            valueSuffix: ''
                        }
                    }]
                });
            }
            var genderGraphAnalytics = function(malefollower, femalefollower) {
               
                $('#gendermap').highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: ''
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    series: [{
                        name: 'Followers',
                        colorByPoint: true,
                        data: [{
                            name: $scope.maleLabel,
                            y: malefollower
                        }, {
                            name: $scope.femaleLabel,
                            y: femalefollower,

                            selected: true
                        }]
                    }],
                    credits: {
                        enabled: false
                    },
                });
                var elements = $("g[style='cursor:pointer;'] text");
                var element1 = $(elements[0]);
                var element2 = $(elements[1]);
                element1.attr("x", "-40");
                element1.attr("y", "25");
                element2.attr("x", "50");
                element2.attr("y", "0");

            }
            var demoGraphicChart = function(countryList) {
                $('#world-map').vectorMap({
                    map: 'world_mill_en',
                    backgroundColor: "transparent",
                    // enableZoom: false,
                    regionStyle: {
                        initial: {
                            fill: '#e4e4e4',
                            "fill-opacity": 0.9,
                            stroke: 'none',
                            "stroke-width": 0,
                            "stroke-opacity": 0
                        }
                    },
                    series: {
                        regions: [{
                            values: countryList,
                            scale: ["#1ab394", "#22d6b1"],
                            normalizeFunction: 'polynomial'
                        }]
                    },
                });
            }

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

            $scope.getProfileData = function(page) {
                if ($rootScope.instagramId)
                    influencer.get({ url: 'influencer', id: $rootScope.instagramId }).$promise.then(function(data) {

                        if (page === "campaign" || page === "mycampaign" || page === "mybookmarks" || page === "message") {

                            if (data.exist === false || data.aboutMe === undefined || data.aboutMe.email === undefined) {

                                $scope.firstTimeLogging = true;
                                $state.go('influencer.profile.aboutMe');
                                $scope.instagramProfile();
                                translateGrowl.translateGrowlMessage('INFLUENCER.NEW_INFLUENCER_MESSAGE', 'info');

                                if ($rootScope.status != 'Verified')
                                    $scope.termsAndConditionCheckPopup();
                                $scope.aboutMe = {};
                                $scope.aboutMe.gender = "male";
                                $scope.aboutMe.minPrice = 100;
                                return false;
                            }

                        }
                        if ($state.current.name === 'influencer.analytics') {
                            $scope.countryList = undefined;
                            if (data.followerDemographics !== undefined) {
                                $scope.followerDemographics = jQuery.parseJSON(data.followerDemographics);
                                $scope.malefollower = $scope.followerDemographics.gender.male;
                                $scope.femalefollower = $scope.followerDemographics.gender.female;
                                $scope.topfollowerDemographybyCountry = $scope.followerDemographics.topfollowerDemographybyCountry;
                                /*sort the countries list*/
                                var countrySortedList = [];
                                angular.forEach($scope.topfollowerDemographybyCountry, function(value, key) {
                                    countrySortedList.push({ name: key, value: value });
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
                                angular.forEach($scope.topfollowerDemographybyCities, function(value, key) {
                                    citySortedList.push({ name: key, value: value });
                                });
                                citySortedList.sort(function(obj1, obj2) {
                                    // Ascending: first age less than the previous
                                    return obj1.value - obj2.value;
                                });
                                $scope.citySortedList = citySortedList.reverse();
                                //console.log($scope.citySortedList);
                                /*sorting for cities ends here*/
                                $scope.countryList = "{";
                                var tmpstring = "";
                                var quote = '"';
                                angular.forEach($scope.followerDemographics.topfollowerDemographybyCountry, function(value, key) {
                                    if (key != "Others") {
                                        var arr = key.split('-');
                                        tmpstring = tmpstring + quote + arr[1] + quote + ":" + value + ",";
                                    }

                                });
                                tmpstring = tmpstring.slice(0, -1);
                                $scope.countryList = $scope.countryList + tmpstring + "}";
                                $scope.countryList = JSON.parse($scope.countryList);
                                demoGraphicChart($scope.countryList);
                                $translate('HOMEPAGE.MALE')
                                    .then(function (translatedValue) {
                                    $scope.maleLabel = translatedValue;
                                });
                                $translate('HOMEPAGE.FEMALE')
                                    .then(function (translatedValue) {
                                    $scope.femaleLabel = translatedValue;
                                    genderGraphAnalytics($scope.malefollower, $scope.femalefollower);
                                });
                                
                                //console.log($scope.malefollower)
                            }


                            if (data.bestTimeToPost !== undefined) {
                                var output = [];
                                var tmplikeByHour = [];
                                $scope.selectedTimezone = data.preferredTimezone;
                                $scope.postingData = data.bestTimeToPost
                                $scope.bestTimeOfPostByTimezone($scope.postingData,$scope.selectedTimezone);

                                angular.forEach(jQuery.parseJSON(data.bestTimeToPost), function(item) {
                                    //get the user timezone
                                    if (data.preferredTimezone) {
                                        var date = new Date(parseInt(item.created_time) * 1000);
                                        //console.log('Date-',date,'ConvertedDate-',moment(date).tz(data.preferredTimezone).format("YYYY-MM-DD HH:mm:ss"))
                                        var hour = moment(date).tz(data.preferredTimezone).format("H");
                                        //console.log(hour);
                                    } else {
                                        var date = new Date(parseInt(item.created_time) * 1000);
                                        var hour = date.getHours();
                                    }
                                    //console.log(convertedDate)
                                    if (output[hour] !== undefined) {
                                        output[hour] = output[hour] + 1;
                                        tmplikeByHour[hour] = tmplikeByHour[hour] + item.likes;
                                    } else {
                                        output[hour] = 1;
                                        tmplikeByHour[hour] = item.likes;
                                    }

                                });
                                $scope.postsHourlyCountArray = [];
                                $scope.avgLikesCountArray = [];
                                $scope.hourArray = [];
                                for (var i = 0; i <= output.length; i++) {
                                    if (output[i] !== null && output[i] !== '' && output[i] !== undefined) {
                                        $scope.hourArray.push(i);
                                        $scope.postsHourlyCountArray.push(output[i]);
                                        $scope.avgLikesCountArray.push(Math.round(tmplikeByHour[i] / output[i]));
                                    }
                                }
                            }
                            /*angular.forEach(jQuery.parseJSON(data.postingAnalytics), function(data) {
                                    $scope.hourArray.push(data.hour);
                                    $scope.postsHourlyCountArray.push(data.noOfMediaPosted);
                                    $scope.avgLikesCountArray.push(data.avgLikes);


                            });*/
                            $scope.tags = jQuery.parseJSON(data.tags);
                             $translate('ANALYTICS.AVG_LIKES')
                                .then(function (translatedValue) {
                                $scope.avgLikesLabel = translatedValue;
                            });
                            $translate('ANALYTICS.TOTAL_POSTS')
                                .then(function (translatedValue) {
                                $scope.totalPostsLabel = translatedValue;
                                barGraphAnalytics($scope.hourArray, $scope.postsHourlyCountArray, $scope.avgLikesCountArray);
                            });
                            

                        }
                        $rootScope._id = data._id;

                      

                        if (data.aboutMe !== undefined && data.aboutMe.email !== undefined) {
                            $scope.aboutMe = data.aboutMe;
                            $scope.aboutMe.minPrice = parseFloat(data.aboutMe.minPrice);
                            if ($scope.aboutMe.phone != undefined)
                                $scope.aboutMe.phone.phoneNumber = parseInt(data.aboutMe.phone.phoneNumber);
                            $scope.arrayToString(data.aboutMe.category);
                            $rootScope.categoryData = data.aboutMe.category;

                            if (data.aboutMe.birthday == null) {
                                $scope.aboutMe.birthday = new Date("September 15, 2010");
                            } else {
                                var date = new Date(data.aboutMe.birthday);
                                $scope.aboutMe.month = date.getMonth();

                                $scope.aboutMe.year = date.getFullYear();
                            }
                        }

                        $scope.aboutPayment = data.paymentDetails;
                        $scope.notification = data.notificationSetting;
                        $scope.profilePhoto = data.profilePhoto;
                        $scope.averageLikes = data.averageLikes;
                        $scope.followed_by = data.followed_by;
                        $scope.averageComments = data.averageComments;
                        $scope.paypalsetting = data.paypalSetting;
                        $scope.instagramProfile();
                        $scope.photos = data.photos;

                        $scope.language = {
                            language: data.language,
                            preferredLanguage: data.preferredLanguage,
                            preferredTimezone: data.preferredTimezone
                        };
                        if (data.status);
                        $rootScope.status = data.status;
                        $scope.initLanguage();



                      /*  if (page == "campaign") {
                            $scope.paypalEmailPopup(true, $rootScope._id, data.paypalSetting);
                            $scope.getCampaignData();
                        }*/
                        if (page == 'language') {
                            $scope.initLanguage();
                        }
                        if (page == "message") {
                            $scope.subcribleUserToMessageSender_($rootScope._id);
                            $scope.getConversationsRealtedToUser_($rootScope._id);
                            $scope.catchMessagesFromSender_();
                            $scope.paypalEmailPopup(false, $rootScope._id, data.paypalSetting);
                        }
                        
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
            };
            $scope.influencerExist = function(page) {
                if ($rootScope.instagramId)
                    influencer.get({ url: 'checkInfluencerExistence', id: $rootScope.instagramId }).$promise.then(function(data) {

                        if (data.exist === false || data.aboutMe === undefined || data.aboutMe.email === undefined) {

                            $scope.firstTimeLogging = true;
                            $scope.aboutMe = {};
                            $scope.aboutMe.gender = "male";
                            $scope.aboutMe.minPrice = 100;
                            $state.go('influencer.profile.aboutMe');
                            $scope.instagramProfile();
                            translateGrowl.translateGrowlMessage('INFLUENCER.NEW_INFLUENCER_MESSAGE', 'info');

                            if ($rootScope.status != 'Verified')
                                $scope.termsAndConditionCheckPopup();
                            
                        } else {
                            $rootScope._id = data._id;
                            $scope.userIsOkay =true;
                            if(page!=="campaign" && page!=="mycampaign"  && page!=="mybookmarks"){
                                $scope.getProfileData(page);
                            }
                        }
                        return false;
                    }).catch(function(error) {
                        translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                    });
            };
            $scope.upload = function(file, message, sender, form, campaign, heading, type, conversationId, statusChanged) {
                /*Upload.upload({
                    url: 'localFileUpload',
                    data: { file: file }
                }).then(function(resp) {
                    form = { $valid: true };
                    $scope.sendMessageData(sender, message, form, campaign, resp.data, heading, type, conversationId, statusChanged);
                    if (type == 'workSubmit') {
                        $scope.changeConversationState(conversationId, 'inReview');
                    }
                    //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function(resp) {
                    //console.log('Error status: ' + resp.status);
                }, function(evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
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
                                form = { $valid: true };
                                $scope.sendMessageData(sender, message, form, campaign, resp.data.result.secure_url, heading, type, conversationId, statusChanged);
                                if (type == 'workSubmit') {
                                    $scope.changeConversationState(conversationId, 'inReview');
                                }
                                //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
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
            $scope.changeConversationState = function(conversationId, status) {
                var object1 = {};
                object1.status = status;
                advertiser.save({
                    url: 'conversation',
                    id: conversationId
                }, object1).$promise.then(function(result) {
                    console.log("result", result);
                    //$scope.releasePopupSuccess();

                    return false;
                }).catch(function(error) {
                    console.log("error", error);
                    translateGrowl.translateGrowlMessage('ERROR_MESSAGE.API_ERROR_MESSAGE', 'error');
                });
            };
        }
    ]);
    angular.module('users').run(['$rootScope', function($rootScope) {
        $rootScope.influ_Cham = true;
    }]);
}());
