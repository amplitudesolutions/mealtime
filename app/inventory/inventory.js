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

	$scope.filterText = "";
	$scope.itemAdded = "";
	$scope.itemname = "";
	
	$scope.categories = fbCategories.$asArray();
	$scope.items = fbItem.$asArray();

	$scope.itemEditId = null;

	$scope.setFilter = function(category) {
		$scope.filterText = category;
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

	function getDefaultCategory() {
	    var returnData = null;
	    categoriesRef.orderByChild('default').startAt(true).endAt(true).once('value', function(snap) {
	      snap.forEach(function(snapData) {
	        returnData = snapData.key();
	      });
	    });
	    return returnData;
	};

	$scope.addNewItem = function() {
		var defaultCategory = getDefaultCategory();
		$scope.itemAdded = "";

		if ($scope.itemname) {
		    itemsRef.orderByChild("name").startAt($scope.itemname).endAt($scope.itemname).once('value', function(dataSnapshot) {
		      	if (dataSnapshot.val() === null) {
			    	//Create New Item
			        $scope.items.$add({ name: $scope.itemname, category: defaultCategory, stock: 0, minstock: 0}).then(function(ref) {         
			          categoriesRef.child("/" + defaultCategory + "/items/" + ref.key()).set(true);
			          $scope.itemAdded = ref.key();
			        });
		      	} else {
			      	dataSnapshot.forEach(function(snap){
				    	$scope.itemExists = $scope.items.$getRecord(snap.key()).$id;
				    });
		      	}
			    // $scope.itemname = "";
		    });
		}
	};

	$scope.changeCategory = function(item, category_id) {
		itemsRef.child(item.$id + "/category").transaction(function(category) {
		  listRef.child('/Default/items/' + item.$id + '/category').transaction(function(category){
		  	console.log(category);
		  	if (category !== null)
		  		return category_id;
		  });
	      return category_id;
	    }), function(error, committed, snapshot) {
	      if (error) {
	        console.log('Transaction failed abnormally!', error);
	      }
	    };
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
	    listRef.child("/Default/items/" + item.$id).remove();
	    itemsRef.child(item.$id).remove();
	  };
}]);