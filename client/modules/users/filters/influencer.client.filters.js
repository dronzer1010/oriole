(function () {
'use strict';
angular.module('users').filter('influencerPriceRangeFilter', function () {
    return function ( items, rangeInfo ) {
        if(rangeInfo === null || rangeInfo === undefined) return items; 
        var min = parseInt(rangeInfo[0]);
        var max = parseInt(rangeInfo[1]);
        var filtered = [];
        // If time is with the range
        angular.forEach(items, function (item) {
            //console.log("item.aboutMe.minPrice", item.aboutMe.minPrice, "min", min, "max", max );
            /*if( item.priceRange.from >= min && item.priceRange.to <= max ) {
                filtered.push(item);
            }else if( item.priceRange.from >= min && max === 1000 ) {
                filtered.push(item);
            }*/

            if(item.priceRange.from >=min && item.priceRange.to<=max){
                filtered.push(item);    
            }else if(item.priceRange.from >=min && item.priceRange.to>=max && item.priceRange.from<=max){
                filtered.push(item);
            }else if(item.priceRange.from <=min && item.priceRange.to>=max){
                filtered.push(item);
            }else if(item.priceRange.from <=min && item.priceRange.to < max && item.priceRange.to > min){
                filtered.push(item);
            }
            else if(item.priceRange.from <=min && max==1000 && item.priceRange.to >=min){
                filtered.push(item);
            }else if(item.priceRange.from >=min && max==1000){
                filtered.push(item);
            }


        });
        return filtered;
    };
});


angular.module('users').filter('influencerAgeRangeFilter', function () {
    return function ( items, rangeInfo ) {
        if(rangeInfo === null || rangeInfo === undefined) return items; 
        var min = parseInt(rangeInfo[0]);
        var max = parseInt(rangeInfo[1]);
        var filtered = [];
        // slider 27 -49
        //camp 20-40
        angular.forEach(items, function (item) {

            if(item.targetAge.from >=min && item.targetAge.to<=max){
                filtered.push(item);    
            }else if(item.targetAge.from >=min && item.targetAge.to>=max && item.targetAge.from<=max){
                filtered.push(item);
            }else if(item.targetAge.from <=min && item.targetAge.to>=max){
                filtered.push(item);
            }else if(item.targetAge.from <=min && item.targetAge.to < max && item.targetAge.to > min){
                filtered.push(item);
            }
            else if(item.targetAge.from <=min && max==50 && item.targetAge.to >=min){
                filtered.push(item);
            }else if(item.targetAge.from >=min && max==50){
                filtered.push(item);
            }

        });
        return filtered;
    };
});


angular.module('users').filter('influencerGenderFilter', function () {
    return function ( items, female, male) {
        //if(gender == null ) return items; 
        // If time is with the range
        var filtered = [];
        angular.forEach(items, function (item) {
            //console.log("item.aboutMe.minPrice", item.aboutMe.minPrice, "min", min, "max", max );
            if( item.gender ==  female) {
                filtered.push(item);
            }
            if( item.gender ==  male) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});
}());