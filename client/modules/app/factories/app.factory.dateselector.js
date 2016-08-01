(function () {
    'use strict';
    var appModule = angular.module('home');
    appModule.factory('dateselector', function() {
        
        var totaldays = 31;
        var totalyears = 100;
        var i;
        var days = [];
        for (i = 0; i < totaldays; i += 1) {
            days.push(i + 1);
        }


        var years = [];
        var dueYear = [];
        var currentYear = new Date().getFullYear();
        for (i = currentYear; i > currentYear - totalyears; i--) {
                years.push(i);
        }
        for (i = currentYear; i <= currentYear+1; i++) {
                  dueYear.push(i);
        }
        var months = [
            { value: 0, name: 'January' },
            { value: 1, name: 'February' },
            { value: 2, name: 'March' },
            { value: 3, name: 'April' },
            { value: 4, name: 'May' },
            { value: 5, name: 'June' },
            { value: 6, name: 'July' },
            { value: 7, name: 'August' },
            { value: 8, name: 'September' },
            { value: 9, name: 'October' },
            { value: 10, name: 'November' },
            { value: 11, name: 'December' }
        ];
        var factory = {};
        
        factory.days = function () {
          return days;
        }
        factory.months = function () {
          return months;
        }
        factory.years = function(){
            return years;
        }
        factory.dueYear = function(){
            return dueYear;
        }
        return factory;
        
    });
}());