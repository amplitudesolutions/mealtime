'use strict';

angular.module('myApp.dashboard', ['ngRoute', 'ngAnimate'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.html',
    controller: 'DashboardCtrl'
  });
}])

.controller('DashboardCtrl', ['$scope', '$firebase', function($scope, $firebase) {

  // connect to firebase 
  var baseRef = new Firebase("https://intense-inferno-9799.firebaseio.com");
  var categoriesRef = baseRef.child('categories');
  var itemsRef = baseRef.child('items');
  var listRef = baseRef.child('lists');

  var fb = $firebase(categoriesRef);
  var fbItem = $firebase(itemsRef);
  var fbList = $firebase(listRef);

  $scope.categories = fb.$asArray();
  $scope.items = fbItem.$asArray();
  $scope.list = fbList.$asArray();

  $scope.populate = function() {
    fb.$set({
        Uncategorized: {name: 'Uncategorized'}
    });

    fbList.$set({
      Default: {name: 'Default List'}
    })

    fbItem.$set({});
  };

  $scope.addCategoryState = false;

	$scope.categories = fb.$asArray();

  $scope.recipes = [
    {id: 1, text: 'Cajun Chicken'},
    {id: 2, text: 'Vegetarian Lasangna'},
    {id: 3, text: 'Earls Potatoe Salad'},
    {id: 4, text: 'Flatbread Pizza'},
    {id: 5, text: 'Lemon Chicken Pasta'},
    {id: 6, text: 'Beef Pho'}
  ];

	$scope.setAddCategoryState = function(state) {
    $scope.addCategoryState = state;
  };

  $scope.isAddCategory = function() {
    return $scope.addCategoryState;
  };

	$scope.addCategory = function() {	
		//$scope.categories.push({id: $scope.categories.length, text:$scope.categoryname});
    //var list = $firebase(ref).$asArray();
    $scope.categories.$add({ name: $scope.categoryname }).then(function(ref) {
      var id = ref.key();
      //console.log("added record with id " + id);
      $scope.categories.$indexFor(id); // returns location in the array
    });

		$scope.categoryname = '';
	};

	$scope.addNewItem = function() {
		var existingItem = null;

    itemsRef.orderByChild("name").startAt($scope.itemname.name).endAt($scope.itemname.name).once('value', function(dataSnapshot) {
      //Will only be one.
      dataSnapshot.forEach(function(snap){
        //console.log(snap.key());
        existingItem = snap.key();  
      });
      
      if (existingItem === null) {
        //Create New Item
        $scope.items.$add({ name: $scope.itemname.name }).then(function(ref) {
          ref.child("category/" + $scope.categories.$keyAt($scope.categories[0])).set(true);
          categoriesRef.child("/" + $scope.categories.$keyAt($scope.categories[0]) + "/items/" + ref.key()).set(true);
          $scope.addItem(ref.key());
        });
      } else {
        $scope.addItem(existingItem);
      }

      $scope.itemname.name = "";
    });

	};

	$scope.addItem = function(item) {

    var listItemRef = listRef.child("/" + $scope.list[0].$id + "/items/");
    
    //Check if item exists, if not create it.
    listItemRef.child(item).transaction(function(currentData){
      if (currentData === null) {
        return { quantity: 1 };
      } else {
        listItemRef.child(item + "/quantity").transaction(function(quantity) {
          return quantity+1;
        });
      }
    }, function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      }
    });
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

.directive('draggable', function() {
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
})

.directive('droppable', function() {
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

          var baseRef = new Firebase("https://intense-inferno-9799.firebaseio.com");
          var categoryRef = baseRef.child('categories')
          var itemsRef = baseRef.child(/items/ + item.id);

          var previousCat = null;
          //console.log(itemsRef.child("categories"));
          itemsRef.child('/category').once('value', function(data){
            data.forEach(function(snap){
              previousCat = snap.key();
            });
          });

          console.log("Remove Child: " + categoryRef.child(previousCat + "/items/" + item.id));
          categoryRef.child(previousCat + "/items/" + item.id).set(null);
          console.log("Adding Child: " + categoryRef.child(binId + "/items/" + item.id));
          categoryRef.child(binId + "/items/" + item.id).set(true);
          
          //console.log("old cat: " + itemsRef.child('category'));
          //Removes old category from item and adds new one
          itemsRef.child("category").remove();
          itemsRef.child("category/" + binId).set(true);
        
          this.classList.remove('over');
                    
          // console.log("Bin: " + binId);
          
          // console.log("item: " + item.id);
          
          return false;
        },
        false
      );
    }
  }
})

;