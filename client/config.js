// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    'use strict';
    // Init module configuration options
    var applicationModuleName = 'expaus';
    var applicationModuleVendorDependencies = ['ngRoute','ngResource', 'ui.router', 'ui.bootstrap', 'angular-growl', 'ngFileUpload', 'ngSanitize', 'luegg.directives', 'pascalprecht.translate', 'ngCookies', 'angularUtils.directives.dirPagination','satellizer','color.picker'];
    // Add a new vertical module
    var registerModule = function(moduleName, dependencies) {
        angular.module(moduleName, dependencies || []);
        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
        //dev, block, prod
        angular.module(applicationModuleName).constant('ENV', 'block');
    };
    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
}());
