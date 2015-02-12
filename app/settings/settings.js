'use strict';

angular.module('myApp.settings', ['ngRoute', 'ngAnimate'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/settings', {
    templateUrl: 'settings/settings.html',
    controller: 'SettingsCtrl'
  });
}])

.controller('SettingsCtrl', ['$scope','$firebase', 'getDBUrl', function($scope, $firebase, getDBUrl) {
	var baseRef = new Firebase(getDBUrl.path);
	var recipeRef = baseRef.child('settings');
}]);