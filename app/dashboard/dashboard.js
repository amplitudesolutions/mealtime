'use strict';
// angular.module('myApp.dashboard', ['ngAnimate','ngToast'])

angular.module('myApp.dashboard', ['myApp.services.dashboardService', 'myApp.directives.dashboardDirective'])

  .config(['ngToastProvider', function(ngToastProvider) {
    ngToastProvider.configure({
      animation: 'slide',
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      maxNumber: 0,
      className: 'info',
      dismissButton: true,
    });
}])

.controller('DashboardCtrl', ['$scope', 'getDBUrl', 'sideBarNav', 'list', 'category', 'filterFilter', 'user', 'ngToast', 'inventory', function($scope, getDBUrl, sideBarNav, list, category, filterFilter, user, ngToast, inventory) {
  $scope.categories = category.get();
  $scope.items = inventory.get();
  $scope.list = list.get();
  $scope.listItems = list.getListItems();

  $scope.categoryEdit = {};
  $scope.addCategoryState = false;
  $scope.categoryEditId = null;

  $scope.categoryEmpty = function(category) {
    var listItems = [];
    var empty = true;
    listItems = filterFilter($scope.listItems, {category: category.$id, gotit: false});
    if (listItems.length >= 1) {
      empty = false;
    }

    return empty;
  };

  $scope.checkInventoryOpen = function(item) {
    if (sideBarNav.state() == false) {
      $scope.addToCart(item);
    }
  };

  $scope.addToCart = function(item) {
    list.addToCart(item);
  };

  $scope.removeFromCart = function(item) {
    list.removeFromCart(item);
  };

  $scope.clearCart = function() {
    list.clearCart();
  };

  $scope.removeItem = function(item) {
    list.remove(item);
  };

  $scope.addQty = function(item) {
    list.addQuantity(item, 1);
  };

  $scope.subtractQty = function(item) {
    list.removeQuantity(item, 1);
  };

  $scope.isDefaultCategory = function(categorySelected) {
    var defaultCategory = false;
    if (categorySelected.$id === category.getDefault()) {
      defaultCategory = true;
    }
    return defaultCategory;
  };

  $scope.isCategoryEditing = function(id) {
    if ($scope.categoryEditId == id) {
      return true;
    } else {
      return false;
    }
  };

  $scope.editCategory = function (category) {
    if (category === null) {
      $scope.categoryEditId = null;
    } else {
      $scope.categoryEdit = angular.copy(category);
      $scope.categoryEditId = category.$id;
    }
  };

  $scope.deleteCategory = function(categorySelected) {
    category.delete(categorySelected);
    ngToast.create('Category Deleted');
  };

  $scope.saveCategory = function(cat) {
    category.save(cat);
    $scope.categoryEditId = null;
  };

	$scope.setAddCategoryState = function(state) {
    $scope.addCategoryState = state;
  };

  $scope.isAddCategory = function() {
    return $scope.addCategoryState;
  };

	$scope.addCategory = function() {	
    var cat = {};
    cat.name = $scope.categoryname;
    cat.color = 'default';
    category.add(cat);

		$scope.categoryname = '';
	};

  //Add New Item to Inventory
	$scope.addNewItem = function() {
    var defaultCategory = category.getDefault();

    if ($scope.itemname) {
      inventory.add($scope.itemname).then(function(data) {
        $scope.addItem(data);
      });

      $scope.itemname.name = "";        
    }
	};

  //Add New Item to List
	$scope.addItem = function(item) {
    list.add(item);
    $scope.itemname.name = "";
	};

  $scope.emptyList = function() {
    $scope.list = [];
  };
}])

;