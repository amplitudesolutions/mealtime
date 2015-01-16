'use strict';

angular.module('myApp.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.html',
    controller: 'DashboardCtrl'
  });
}])

.controller('DashboardCtrl', ['$scope', function($scope) {

	$scope.categories = [
		{id: 1, text: 'Fruits'},
		{id: 2, text: 'Vegetables'},
		{id: 3, text: 'Meats'},
		{id: 4, text: 'Dairy'},
		{id: 5, text: 'Dry Goods'},
		{id: 6, text: 'Uncategorized'}
	];
	$scope.recipes = [
		{id: 1, text: 'Cajun Chicken'},
		{id: 2, text: 'Vegetarian Lasangna'},
		{id: 3, text: 'Earls Potatoe Salad'},
		{id: 4, text: 'Flatbread Pizza'},
		{id: 5, text: 'Lemon Chicken Pasta'},
		{id: 6, text: 'Beef Pho'}
	];

	$scope.ingredients = [
		{id: 1, recipe_id: 1, item_id: 1},
		{id: 1, recipe_id: 4, item_id: 3},
		{id: 1, recipe_id: 4, item_id: 6}
	];

	$scope.items = [
		{id: 1, text: 'Chicken', category: $scope.categories[2]},
		{id: 2, text: 'Penne Noodles', category: $scope.categories[4]},
		{id: 3, text: 'Flatbread', category: $scope.categories[4]},
		{id: 4, text: 'Beef Steak', category: $scope.categories[2]},
		{id: 5, text: 'Rice Noodles', category: $scope.categories[4]},
		{id: 6, text: 'Cheese', category:  $scope.categories[3]},
		{id: 7, text: 'Oranges', category: $scope.categories[0]},
		{id: 8, text: 'Appricots', category:  $scope.categories[0]}
	];

	$scope.list = [
		{"id": "1", "item": {"text": "Chicken", "category": "Meats"}, "quantity": "1"},
		// {"id": "2", "item": {"text": "Flatbread", "category": "Dry Goods"}},
		// {"id": "3", "item": {"text": "Cheese", "category": "Dairy"}},
		// {"id": "4", "item": {"text": "Beef Steak", "category": "Meats"}},
		// {"id": "5", "item": {"text": "Penne Noodles", "category": "Dry Goods"}},
		// {"id": "6", "item": {"text": "Apples", "category": "Fruits"}},
		// {"id": "7", "item": {"text": "Bananas", "category": "Fruits"}},
		// {"id": "8", "item": {"text": "Carrots", "category": "Vegetables"}},
		// {"id": "9", "item": {"text": "Celery", "category": "Vegetables"}}
	];

	$scope.addCategory = function() {	
		$scope.categories.push({id: $scope.categories.length, text:$scope.categoryname});
		$scope.categoryname = '';
	};

	$scope.addNewItem = function() {
		var existingItem = -1;
		//Check if item exists in item list, if not, add it, then add to grocery list
		for(var i = $scope.items.length - 1; i >= 0; i--){
       		if($scope.items[i].text == $scope.itemname.text){
       			existingItem = $scope.items[i];
		 	}
	    }

	    if (existingItem == -1) {
	    	$scope.items.push({id: $scope.items.length, text: $scope.itemname.text, category: $scope.categories[5]});
	    	existingItem = $scope.items[$scope.items.length-1];
	    }
	    $scope.itemname.text = "";
	    $scope.addItem(existingItem);
	};

	$scope.addItem = function(item) {
		var itemExistsId = -1;

		//Need to look at LODash or Underscore.js for utility functions.
		for(var i = $scope.list.length - 1; i >= 0; i--){
       		if($scope.list[i].item.id == item.id){
       			itemExistsId = i;
		 	}
	    }
	    if (itemExistsId == -1) {
	     	$scope.list.push({id: $scope.list.length, item: item, quantity: 1});
	    } else {
	     	$scope.list[itemExistsId].quantity += 1;	
	    }
	};

	$scope.categoryMatch = function(categoryFilter) {
	  return function(list) {
	    return list.item.category.text === categoryFilter;
	  }
	};

	$scope.handleDrop = function() {
        alert('Item has been dropped');
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
      drop: '&' // parent
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
          
          this.classList.remove('over');
          
          var item = document.getElementById(e.dataTransfer.getData('Text'));
          this.appendChild(item);
          
          // call the drop passed drop function
          scope.$apply('drop()');
          
          return false;
        },
        false
      );
    }
  }
});