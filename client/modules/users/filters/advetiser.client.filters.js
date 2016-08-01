(function () {
'use strict';
angular.module('users').filter('priceRangeFilter', function () {
    return function ( items, rangeInfo ) {
        var filtered = [];
        if(rangeInfo === null || rangeInfo === undefined) return items; 
        var min = parseInt(rangeInfo[0]);
        var max = parseInt(rangeInfo[1]);
        // If time is with the range
        console.log(min,max);
        angular.forEach(items, function (item) {
            if( item.aboutMe.minPrice >= min && item.aboutMe.minPrice <= max ) {
                filtered.push(item);
            }else if( item.aboutMe.minPrice >= min && max === 1000 ) {
                filtered.push(item);
            }
            
        });
        return filtered;
    };
});

angular.module('users').filter('ageRangeFilter', function () {
    return function ( items, rangeInfo ) {
        var filtered = [];
        if(rangeInfo === null || rangeInfo === undefined) return items; 
        var min = parseInt(rangeInfo[0]);
        var max = parseInt(rangeInfo[1]);
        // If time is with the range
        angular.forEach(items, function (item) {
            var today = new Date();
            var birthDate = new Date(item.aboutMe.birthday);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if( age >= min && age <= max ) {
                filtered.push(item);
            }else if( age >= min && max === 50 ) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});


angular.module('users').filter('followesRangeFilter', function () {
    return function ( items, rangeInfo ) {
        var filtered = [];
        if(rangeInfo === null || rangeInfo === undefined) return items; 
        var min = parseInt(rangeInfo[0]);
        var max = parseInt(rangeInfo[1]);
        // If time is with the range
        angular.forEach(items, function (item) {
            
                if( item.followed_by >= min && item.followed_by <= max ) {
                    filtered.push(item);
                }else if( item.followed_by >= min && max === 500000 ) {
                    filtered.push(item);
                }
            
        });
        return filtered;
    };
});



angular.module('users').filter('genderFilter', function () {
    return function ( items, female, male) {
        var filtered = [];
        angular.forEach(items, function (item) {
            if( item.aboutMe.gender ==  female) {
                filtered.push(item);
            }
            if( item.aboutMe.gender ==  male) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});


angular.module('users').filter('conversationMessageFilter', function () {
    return function ( items, receiverId) {
        var filtered = [];
        angular.forEach(items, function (item) {
            if( item.sender ==  receiverId) {
                filtered.push(item);
            }
            if( item.recipient ==  receiverId) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});


angular.module('users').filter('conversationFilter', function () {
    return function ( items, status) {
        if(status.length === 0) return items;
        var filteredConversation = [];
        angular.forEach(items, function (item) {
            angular.forEach(status, function (state){
                if(state === item.status){
                    filteredConversation.push(item);
                }
            });
        });
        return filteredConversation;
    };
});
}());