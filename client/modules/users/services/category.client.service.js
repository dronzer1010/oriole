(function() {
    'use strict';
    angular.module('users').factory('categoryService', function() {
        //var category = ["Cosmetic", "Fashion", "Food", "Sports", "Jewellary", "Health", "Travel", "Music"];
        var category = ["HOMEPAGE.COSMETIC", "HOMEPAGE.FASHION", "HOMEPAGE.FOOD", "HOMEPAGE.SPORTS", "HOMEPAGE.JEWELLARY", "HOMEPAGE.HEALTH", "HOMEPAGE.TRAVEL", "HOMEPAGE.MUSIC"];
        return category;
    });
}());
