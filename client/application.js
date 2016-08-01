(function() {
    'use strict';
    //Start by defining the main module and adding the module dependencies
    angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
    // Setting HTML5 Location Mode
    angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider','$authProvider', '$translateProvider',
        function($locationProvider,$authProvider, $translateProvider) {
            $locationProvider.html5Mode(true).hashPrefix('!');
            //locationProvider.hashPrefix('!');
           //prod 10efef3fbbe6497389b645b10bd9fb20
           //dev 900529e381c34d039dfa0fb9c0022ea6
            $authProvider.instagram({
                clientId: '10efef3fbbe6497389b645b10bd9fb20'
            });

            // Instagram
            $authProvider.instagram({
              name: 'instagram',
              url: '/auth/instagram',
              authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
              redirectUri: window.location.origin,
              requiredUrlParams: ['scope'],
              scope: ['basic','public_content','follower_list'],
              scopeDelimiter: '+',
              type: '2.0',

            });
            
            
            $translateProvider
                .useStaticFilesLoader({
                    prefix: '/assets/translations/locale-',
                    suffix: '.json'
                })
                .preferredLanguage('en')
                .useLocalStorage()
                .useMissingTranslationHandlerLog();
            $translateProvider.useSanitizeValueStrategy('escape');
        }
    ]);

    //Then define the init function for starting up the application
    angular.element(document).ready(function() {
        //Fixing facebook bug with redirect
        //if (window.location.hash === '#_=_') window.location.hash = '#!/home';
        //Then init the app
        angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
    });
}());
