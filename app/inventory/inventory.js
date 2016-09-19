'use strict';

angular.module('myApp.inventory', ['myApp.services.inventoryService'])

.controller('InventoryCtrl', ['$scope', 'inventory', 'category', 'ngToast', function($scope, inventory, category, ngToast) {
	$scope.filterText = "";
	$scope.itemAdded = "";
	$scope.itemname = "";
	
	$scope.categories = category.get(); //fbCategories.$asArray();
	$scope.items = inventory.get();

	$scope.itemEditId = null;

	$scope.itemEdit = {};

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

	$scope.editItem = function (item) {
		$scope.itemEditId = item.$id;
		$scope.itemEdit = angular.copy(item);
	};

	$scope.addNewItem = function() {
		var item = {};
		item.name = $scope.itemname;
		item.stock = 0;
		item.minstock = 0;
		item.price = '';
		inventory.add(item);
	};

	$scope.changeCategory = function(item, category_id) {
		inventory.changeCategory(item, category_id);
	};

	$scope.saveItem = function(item) {

		if ($scope.itemEdit.name) {
			// Don't necessarily like this way... will change once I figure out a better way to do it.
			item.name = $scope.itemEdit.name;
			item.searchValue = $scope.itemEdit.searchValue.toLowerCase();
			item.price = $scope.itemEdit.price;

			inventory.save(item).then(function(data) {
				ngToast.create('Item Saved!');
			}, function(error) {
				ngToast.danger({content: 'Issue saving item ' + error});
				console.log(error);
			});

			$scope.itemEditId = null;
			$scope.itemEdit = {};
		}
	};

	$scope.cancel = function() {
		$scope.itemEditId = null;
		$scope.itemEdit = {};
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
	 	inventory.remove(item).then(function(ref) {
			ngToast.create('Item Deleted!');
	 	}, function(error) {
	 		ngToast.danger({content: 'Issue deleting item ' + error});
			console.log(error);
	 	});
	  };
}]);