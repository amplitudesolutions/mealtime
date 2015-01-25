'use strict';

angular.module('myApp.inventory', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/inventory', {
    templateUrl: 'inventory/inventory.html',
    controller: 'InventoryCtrl'
  });
}])

.controller('InventoryCtrl', ['$scope', '$firebase', 'getDBUrl', function($scope, $firebase, getDBUrl) {
	// connect to firebase 
    var baseRef = new Firebase(getDBUrl.path);

	var categoriesRef = baseRef.child('categories');
	var itemsRef = baseRef.child('items');
	var listRef = baseRef.child('lists');
	
	var fbCategories = $firebase(categoriesRef);
	var fbItem = $firebase(itemsRef);
	
	$scope.categories = fbCategories.$asArray();
	$scope.items = fbItem.$asArray();

	$scope.itemEditId = null;

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

	$scope.saveItem = function(item) {
		var name = $scope.items[$scope.items.$indexFor(item.$id)].name.trim();
		if (name) {
			$scope.items.$save(item);
		 } //else {
		// 	$scope.removeTodo(id);
		// }
		$scope.itemEditId = null;
	};

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

	$scope.addMinStock = function(item) {
		itemsRef.child(item.$id + "/minstock").transaction(function(minstock) {
	      return minstock+1;
	    }), function(error, committed, snapshot) {
	      if (error) {
	        console.log('Transaction failed abnormally!', error);
	      }
	    };
	};

	$scope.removeMinStock = function(item) {
		itemsRef.child(item.$id + "/minstock").transaction(function(minstock) {
	      if (minstock != 0) {
	        return minstock-1;
	      }
	    }), function(error, committed, snapshot) {
	      if (error) {
	        console.log('Transaction failed abnormally!', error);
	      }
	    };
	};

	 $scope.deleteItem = function(item) {
	    //Delete Item from Inventory
	    var category = null;

	    itemsRef.child(item.$id).once('value', function(data){
	        category = data.val().category;
	    });

	    categoriesRef.child("/" + category + "/items/" + item.$id).set(null);
	    console.log("/Default/items/" + item.$id);
	    listRef.child("/Default/items/" + item.$id).remove();
	    //listRef.child("/Default/items/" + item.$id).set(null);
	    itemsRef.child(item.$id).remove();
	  };
}]);