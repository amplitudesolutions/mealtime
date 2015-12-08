'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ui.router',
  'ngAnimate',
  'ui.bootstrap',
  'ngTouch',
  'ngToast',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'myApp.dashboard',
  'myApp.inventory',
  'myApp.recipes',
  'myApp.settings',
  'myApp.calendar',
  'myApp.list',
  'myApp.login',
  'myApp.version'
])


// lo dash, that way you can use Dependency injection.
.constant('_', window._)

.run(["$rootScope", "$state", function($rootScope, $state) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the login page
    if (error === "AUTH_REQUIRED") {
      window.location.href = './login';
      // $state.go("login");
    }
  });

  // Used for loading the default view from a parent state.
  // ie) go to /settings and it goes to /settings/general
  $rootScope.$on('$stateChangeSuccess', function(event, toState){
    var aac;
    if(aac = toState && toState.params && toState.params.autoActivateChild){
        $state.go(aac);
    }
  });
}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider,$urlRouterProvider) {

  $urlRouterProvider.otherwise('/dashboard');

  $stateProvider

    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'dashboard/dashboard.html',      
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })

    .state('recipes', {
      url: '/recipes',
      templateUrl: 'recipes/recipes.html',      
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })

    .state('calendar', {
      url: '/calendar',
      templateUrl: 'calendar/calendar.html',      
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })

    .state('inventory', {
      url: '/inventory',
      templateUrl: 'inventory/inventory.html',      
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })

    .state('settings', {
      url: '/settings',
      templateUrl: 'settings/settings.html',
      params: {
        // Load nested view general by default.
        autoActivateChild: 'settings.general'
      },
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })

    .state('settings.general', {
      url: '/general',
      templateUrl: 'settings/general.html',
      //controller: 'SettingGeneralCtrl',     
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })

    .state('settings.units', {
      url: '/units',
      templateUrl: 'settings/units.html',      
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })

    .state('settings.group', {
      url: '/group',
      templateUrl: 'settings/group.html',      
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete]\
          return Auth.$requireAuth();
        }]
      }
    })
    ;
    
}])

;
