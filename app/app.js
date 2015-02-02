'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.dashboard',
  'myApp.inventory',
  'myApp.recipes',
  'myApp.list',
  'myApp.version',
  'ui.bootstrap',
  'firebase'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}])

.controller('MenuCtrl', ['$scope', '$location', 'getDBUrl', '$firebase', function($scope, $location, getDBUrl, $firebase) {
	var baseRef = new Firebase(getDBUrl.path);
  var inventoryRef = baseRef.child('items')
  
  var stockRef = inventoryRef.orderByChild('stock').startAt(1);
  var fbStockItems = $firebase(stockRef);
  $scope.inventory = fbStockItems.$asArray();

  $scope.$location = $location;

	$scope.navbarCollapsed = true;
	$scope.$on('$routeChangeSuccess', function () {
        $scope.navbarCollapsed = true;
    });

    $scope.isActive= function(item) {
    	if (item == $location.path()) {
    		return true;
    	}
    	return false;
    };
}])

.factory('getDBUrl', ['$location', function($location) {
	var dbURL = null;
	if ($location.host() == 'localhost') {
		// DEV DB
    	dbURL = "https://mealtimeprod.firebaseio.com";
	} else {
		dbURL = "https://intense-inferno-9799.firebaseio.com";
	}
	
	return {path: dbURL};
}]);
