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

.controller('DashboardCtrl', ['$scope', '$firebase', 'getDBUrl', 'sideBarNav', 'list', 'category', 'filterFilter', 'user', 'ngToast', function($scope, $firebase, getDBUrl, sideBarNav, list, category, filterFilter, user, ngToast) {
  // connect to firebase
  var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);

  var categoriesRef = baseRef.child('categories');
  var itemsRef = baseRef.child('items');
  var listRef = baseRef.child('lists');

  var fb = $firebase(categoriesRef);
  var fbItem = $firebase(itemsRef);
  var fbList = $firebase(listRef);
  var fbListItems = $firebase(listRef.child('/Default/items'));

  $scope.categories = fb.$asArray();
  $scope.items = fbItem.$asArray();
  $scope.list = list.get(); //fbList.$asArray();
  $scope.listItems = list.getListItems(); //fbListItems.$asArray();
  $scope.categories = fb.$asArray();
  $scope.categoryEdit = {};
  $scope.addCategoryState = false;
  $scope.categoryEditId = null;

  $scope.populate = function() {
    fb.$set({
        Uncategorized: {name: 'Uncategorized', default: true}
    });

    fbList.$set({
      Default: {name: 'Default List'}
    })

    fbItem.$set({});
  };

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
    // listRef.child('/Default/items').remove();

    listRef.child('/Default/items').orderByChild('gotit').startAt(true).endAt(true).once('value', function(snap) {
      snap.forEach(function(snapData) {
        listRef.child('/Default/items/' + snapData.key()).remove();
      });
    });

  };

  $scope.removeItem = function(item) {
    list.remove(item);
    //Remove Item From List
    // listRef.child("/Default/items/" + item.$id).remove();
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

  $scope.addLowItems = function () {
    //This function adds items to the list that are "Low" in stock as defined in the inventory.
    itemsRef.orderByChild("minstock").startAt(1).once("value", function(minStockSnap) {
      minStockSnap.forEach(function(snap) {
        if (snap.val().stock < snap.val().minstock) {
          console.log("Order: " + snap.val().name + " Qty:" + (snap.val().minstock - snap.val().stock));
        }
      });
    });
  };

  //Add New Item to Inventory
	$scope.addNewItem = function() {
    var defaultCategory = category.getDefault();
		var existingItem = null;

    if ($scope.itemname) {

      itemsRef.orderByChild("name").startAt($scope.itemname.name).endAt($scope.itemname.name).once('value', function(dataSnapshot) {
        //Will only be one.
        dataSnapshot.forEach(function(snap){
          existingItem = $scope.items.$getRecord(snap.key()); 
        });
        
        if (existingItem === null) {
          //Create New Item
          $scope.items.$add({ name: $scope.itemname.name, category: defaultCategory, stock: 0, minstock: 0}).then(function(ref) {         
            categoriesRef.child("/" + defaultCategory + "/items/" + ref.key()).set(true);
            $scope.addItem($scope.items.$getRecord(ref.key()));

          });
        } else {
          $scope.addItem(existingItem);
        }

        $scope.itemname.name = "";
      });
    }

	};

  //Add New Item to List
	$scope.addItem = function(item) {
    list.add(item);
    $scope.itemname.name = "";
	};

	$scope.handleDrop = function(item, bin) {
    //Need to look at LODash or Underscore.js for utility functions.
    alert(bin);
    //item is the item key
    //bin is the category key
    //Update Category/Item and Item/Category
  };

  $scope.emptyList = function() {
    $scope.list = [];
  };
}])

;