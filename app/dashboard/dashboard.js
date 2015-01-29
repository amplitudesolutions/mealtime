'use strict';

angular.module('myApp.dashboard', ['ngRoute', 'ngAnimate'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.html',
    controller: 'DashboardCtrl'
  });
}])

.controller('DashboardCtrl', ['$scope', '$firebase', 'getDBUrl', function($scope, $firebase, getDBUrl) {
  // connect to firebase
  var baseRef = new Firebase(getDBUrl.path);

  var categoriesRef = baseRef.child('categories');
  var itemsRef = baseRef.child('items');
  var listRef = baseRef.child('lists');

  var fb = $firebase(categoriesRef);
  var fbItem = $firebase(itemsRef);
  var fbList = $firebase(listRef);
  var fbListItems = $firebase(listRef.child('/Default/items'));

  $scope.categories = fb.$asArray();
  $scope.items = fbItem.$asArray();
  $scope.list = fbList.$asArray();
  $scope.listItems = fbListItems.$asArray();
  $scope.categoryEdit = null;

  $scope.populate = function() {
    fb.$set({
        Uncategorized: {name: 'Uncategorized', default: true}
    });

    fbList.$set({
      Default: {name: 'Default List'}
    })

    fbItem.$set({});
  };

  $scope.addCategoryState = false;
	$scope.categories = fb.$asArray();

  $scope.categoryEditId = null;

  $scope.addToCart = function(item) {
    //$scope.list.$save(item);
    var transactions = baseRef.child("transactions");
    //Add Transaction to Transaction table

    var listItemRef = listRef.child("/" + $scope.list[0].$id + "/items/");
    //Check if item exists, if not create it.
    listItemRef.child(item.$id + "/gotit").transaction(function(gotit){
      if (gotit !== null) {
      //     //Item in list.. need to tell them
      // } else {
        //Add a Transaction
        var purchaseDate = Firebase.ServerValue.TIMESTAMP;
        
        itemsRef.child(item.$id + "/lastpurchase").transaction(function(lastpurchase) {
          return purchaseDate;
        });

        itemsRef.child(item.$id + "/stock").transaction(function(stock) {
          return stock+item.quantity;
        });

        transactions.push({list: $scope.list[0].$id, item: item.$id, date: purchaseDate});
        return !gotit;
      }
    }, function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      }
    });
  };

  $scope.removeFromCart = function(item) {
    var transactions = baseRef.child("transactions");
    //Add Transaction to Transaction table

    var listItemRef = listRef.child("/" + $scope.list[0].$id + "/items/");
    //Check if item exists, if not create it.
    listItemRef.child(item.$id + "/gotit").transaction(function(gotit){
      if (gotit !== null) {
      //     //Item in list.. need to tell them
      // } else {
        //Add a Transaction
        var purchaseDate = Firebase.ServerValue.TIMESTAMP;
        
        itemsRef.child(item.$id + "/lastpurchase").transaction(function(lastpurchase) {
          return purchaseDate;
        });

        itemsRef.child(item.$id + "/stock").transaction(function(stock) {
          return stock-item.quantity;
        });

        transactions.push({list: $scope.list[0].$id, item: item.$id, date: purchaseDate});
        return !gotit;
      }
    }, function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      }
    });
  };

  $scope.isCategoryEditing = function(id) {
    if ($scope.categoryEditId == id) {
      return true;
    } else {
      return false;
    }
  };

  $scope.editCategory = function (category) {
    $scope.categoryEdit = angular.copy(category)
    $scope.categoryEditId = category.$id;
  };

  $scope.saveCategory = function(category) {
    var name = $scope.categories[$scope.categories.$indexFor(category.$id)].name.trim();
    if (name) {
      category.name = $scope.categoryEdit.name;
      $scope.categories.$save(category);
     }
    $scope.categoryEditId = null;
  };

  $scope.clearCart = function() {
    // listRef.child('/Default/items').remove();

    listRef.child('/Default/items').orderByChild('gotit').startAt(true).endAt(true).once('value', function(snap) {
      snap.forEach(function(snapData) {
        listRef.child('/Default/items/' + snapData.key()).remove();
      });
    });

  };

  $scope.deleteItem = function(item) {
    //Delete Item from Inventory
    var category = null;

    itemsRef.child(item.$id).once('value', function(data){
        category = data.val().category;
    });

    categoriesRef.child("/" + category + "/items/" + item.$id).set(null);
    console.log("/Default/items/" + item.$id);
    $scope.removeItem(item);
    //listRef.child("/Default/items/" + item.$id).set(null);
    itemsRef.child(item.$id).remove();
  };

  $scope.removeItem = function(item) {
    //Remove Item From List
    listRef.child("/Default/items/" + item.$id).remove();
  };

  $scope.addQty = function(item) {
    var listItemRef = listRef.child("/" + $scope.list[0].$id + "/items/");
    //Check if item exists, if not create it.

    listItemRef.child(item.$id + "/quantity").transaction(function(quantity) {
      return quantity+1;
    }), function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      }
    };
  };

  $scope.subtractQty = function(item) {
    var listItemRef = listRef.child("/" + $scope.list[0].$id + "/items/");
    //Check if item exists, if not create it.

    listItemRef.child(item.$id + "/quantity").transaction(function(quantity) {
      if (quantity <= 1) {
        $scope.removeItem(item);
      } else {
        return quantity-1;
      }
    }), function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      }
    };
  };

	$scope.setAddCategoryState = function(state) {
    $scope.addCategoryState = state;
  };

  $scope.isAddCategory = function() {
    return $scope.addCategoryState;
  };

  $scope.setDefaultCategory = function(categoryItem) {
    categoryItem.child('default').set(true);
  };

	$scope.addCategory = function() {	
    $scope.categories.$add({ name: $scope.categoryname, color: 'default' }).then(function(ref) {
      //var id = ref;
      if ($scope.categories.length == 1) {
        $scope.setDefaultCategory(ref);
      }
    });

		$scope.categoryname = '';
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
    var defaultCategory = getDefaultCategory();
		var existingItem = null;

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

	};

  //Add New Item to List
	$scope.addItem = function(item) {

    var listItemRef = listRef.child("/" + $scope.list[0].$id + "/items/");
    //Check if item exists, if not create it.
    listItemRef.child(item.$id).transaction(function(currentData){
      if (currentData === null) {
          return { quantity: 1, category: item.category, gotit: false};
      } else {
        listItemRef.child(item.$id + "/quantity").transaction(function(quantity) {
          return quantity+1;
        });
      }
    }, function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      }
    });
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

.directive('draggable', [function() {
  return function(scope, element) {
    // this gives us the native JS object
    var el = element[0];
    
    el.draggable = true;
    
    el.addEventListener(
      'dragstart',
      function(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', this.id);
        this.classList.add('drag');
        return false;
      },
      false
    );
    
    el.addEventListener(
      'dragend',
      function(e) {
        this.classList.remove('drag');
        return false;
      },
      false
    );
  }
}])

.directive('droppable', ['getDBUrl', function(getDBUrl) {
  return {
    scope: {
      drop: '&',
      bin: '='
    },
    link: function(scope, element) {
      // again we need the native object
      var el = element[0];
      
      el.addEventListener(
        'dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'move';
          // allows us to drop
          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'dragenter',
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'drop',
        function(e) {
          // Stops some browsers from redirecting.
          if (e.stopPropagation) e.stopPropagation();
          
          var binId = this.id;
          var item = document.getElementById(e.dataTransfer.getData('Text'));
          var list = document.getElementById("List" + binId);

          var baseRef = new Firebase(getDBUrl.path);

          var categoryRef = baseRef.child('categories')
          var itemsRef = baseRef.child('/items/' + item.id);
          var listRef = baseRef.child('/lists/' + 'Default/' + "items/" + item.id);

          var previousCat = null;
          //console.log(itemsRef.child("category"));
          
          itemsRef.once('value', function(data){
            //data.forEach(function(snap){
              //console.log(data.val().category);
              previousCat = data.val().category;
            //});
          });
          itemsRef.child('category').remove();

          // console.log("Remove Child: " + categoryRef.child(previousCat + "/items/" + item.id));
          categoryRef.child(previousCat + "/items/" + item.id).set(null);
          // console.log("Adding Child: " + categoryRef.child(binId + "/items/" + item.id));
          categoryRef.child(binId + "/items/" + item.id).set(true);

          //Add Category to List Item
          listRef.child("category").remove();
          listRef.child("category").set(binId);
          
          //console.log("old cat: " + itemsRef.child('category'));
          //Removes old category from item and adds new one
          itemsRef.child("category").remove();
          //itemsRef.child("category/" + binId).set(true);
          itemsRef.child("category").set(binId);
        
          this.classList.remove('over');
                    
          // console.log("Bin: " + binId);
          
          // console.log("item: " + item.id);
          
          return false;
        },
        false
      );
    }
  }
}])

;