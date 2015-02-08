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
  'firebase',
  'ngTouch'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}])

.controller('MainCtrl', ['$scope', 'sideBarNav', function($scope, sideBarNav) { 
  $scope.sideBarOpen = function() {
    sideBarNav.swipeOpen();
  };

  $scope.sideBarClose = function() {
    sideBarNav.swipeClose();
  };
}])

.controller('MenuCtrl', ['$scope', '$location', 'getDBUrl', '$firebase', 'sideBarNav', function($scope, $location, getDBUrl, $firebase, sideBarNav) {
	var baseRef = new Firebase(getDBUrl.path);
  var inventoryRef = baseRef.child('items')
  
  var stockRef = inventoryRef.orderByChild('stock').startAt(1);
  var fbStockItems = $firebase(stockRef);
  $scope.inventory = fbStockItems.$asArray();

  $scope.$location = $location;

	$scope.navbarCollapsed = true;

  $scope.sideBarState = function() {
    sideBarNav.toggle();
  };

	$scope.$on('$routeChangeSuccess', function () {
      $scope.navbarCollapsed = true;
  });

  $scope.isActive = function(item) {
  	if (item == $location.path()) {
  		return true;
  	}
  	return false;
  };
}])

.controller('InventoryListCtrl', ['$scope', 'getDBUrl', '$firebase', 'sideBarNav', function($scope, getDBUrl, $firebase, sideBarNav) {
  var baseRef = new Firebase(getDBUrl.path);
  var inventoryRef = baseRef.child('items')
  
  var stockRef = inventoryRef.orderByChild('stock').startAt(1);
  var fbStockItems = $firebase(stockRef);
  $scope.inventory = fbStockItems.$asArray();

  var categoriesRef = baseRef.child('categories');
  var fbCategories = $firebase(categoriesRef);

  $scope.categories = fbCategories.$asArray();

  $scope.filterText = "";
  $scope.searchitem = "";
  $scope.sideBarState = sideBarNav.state();

  $scope.$watch(function () { return sideBarNav.state(); }, function (newValue) {
    $scope.sideBarState = newValue;
    $scope.menuCategoryStatus.isopen = false;
  });

  $scope.setFilter = function(category) {
    $scope.filterText = category;
    $scope.menuCategoryStatus.isopen = false;
  };
}])

.factory('getDBUrl', ['$location', function($location) {
	var dbURL = null;
	if ($location.host() == 'localhost' || $location.host() == 'mealtimeprod.firebaseapp.com') {
		// DEV DB
    	dbURL = "https://mealtimeprod.firebaseio.com";
	} else if ($location.host() == 'intense-inferno-9799.firebaseapp.com') {
		dbURL = "https://intense-inferno-9799.firebaseio.com";
	}
	
	return {path: dbURL};
}])

.factory('sideBarNav', [function() {
  var isOpen = false;

  return {
    swipeOpen: function() {
      isOpen = true;
    },
    swipeClose: function() {
      isOpen = false;
    },
    toggle: function() {
      isOpen = !isOpen;
    },
    state: function() {
      // console.log(isOpen);
      return isOpen;
    }
  };

}])
;
