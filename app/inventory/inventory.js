'use strict';

angular.module('myApp.inventory', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/inventory', {
    templateUrl: 'inventory/inventory.html',
    controller: 'InventoryCtrl',
    resolve: {
	    // controller will not be loaded until $waitForAuth resolves
	    // Auth refers to our $firebaseAuth wrapper in the example above
	    "currentAuth": ["Auth", function(Auth) {
	      // $waitForAuth returns a promise so the resolve waits for it to complete]\
	      return Auth.$requireAuth();
	    }]
	}
  });
}])

.controller('InventoryCtrl', ['$scope', 'inventory', 'category', function($scope, inventory, category) {
	$scope.filterText = "";
	$scope.itemAdded = "";
	$scope.itemname = "";
	
	$scope.categories = category.get(); //fbCategories.$asArray();
	$scope.items = inventory.get();

	$scope.itemEditId = null;

	$scope.setFilter = function(category) {
		$scope.filterText = category;
		$scope.status.isopen = false;
	};

	$scope.isItemEditing = function(id) {
		if ($scope.itemEditId == id) {
			return true;
		} else {
			return false;
		}
	};

	$scope.editItem = function (id) {
		$scope.itemEditId = id;
	};

	$scope.addNewItem = function() {
		var item = {};
		item.name = $scope.itemname;
		item.stock = 0;
		item.minstock = 0;
		inventory.add(item);
	};

	$scope.changeCategory = function(item, category_id) {
		inventory.changeCategory(item, category_id);
	};

	$scope.saveItem = function(item) {
		inventory.save(item);
		$scope.itemEditId = null;
	};

	$scope.addStock = function(item) {
		inventory.addStock(item, 1);
	};

	$scope.removeStock = function(item) {
		inventory.removeStock(item, 1);
	};

	$scope.addMinStock = function(item) {
		inventory.addMinStock(item, 1);
	};

	$scope.removeMinStock = function(item) {
		inventory.removeMinStock(item, 1);
	};

	 $scope.deleteItem = function(item) {
	 	inventory.remove(item);
	  };
}]);