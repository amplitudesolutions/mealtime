'use strict';

angular.module('myApp.inventory', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/inventory', {
    templateUrl: 'inventory/inventory.html',
    controller: 'InventoryCtrl'
  });
}])

.controller('InventoryCtrl', ['$scope', '$firebase', function($scope, $firebase) {
	// connect to firebase 
	var baseRef = new Firebase("https://intense-inferno-9799.firebaseio.com");
	var categoriesRef = baseRef.child('categories');
	var itemsRef = baseRef.child('items');
	
	var fbCategories = $firebase(categoriesRef);
	var fbItem = $firebase(itemsRef);
	
	$scope.categories = fbCategories.$asArray();
	$scope.items = fbItem.$asArray();

	$scope.addStock = function(item) {
	    itemsRef.child(item.$id + "/stock").transaction(function(stock) {
	      return stock+1;
	    }), function(error, committed, snapshot) {
	      if (error) {
	        console.log('Transaction failed abnormally!', error);
	      }
	    };
	};

	$scope.removeStock = function(item) {
	    itemsRef.child(item.$id + "/stock").transaction(function(stock) {
	      if (stock != 0) {
	        return stock-1;
	      }
	    }), function(error, committed, snapshot) {
	      if (error) {
	        console.log('Transaction failed abnormally!', error);
	      }
	    };
	};
}]);