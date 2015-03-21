'use strict';

angular.module('myApp.recipes', ['ngRoute', 'ngAnimate', 'ngToast'])

.config(['$routeProvider', 'ngToastProvider', function($routeProvider, ngToastProvider) {
  $routeProvider.when('/recipes', {
    templateUrl: 'recipes/recipes.html',
    controller: 'RecipesCtrl'
  });
  ngToastProvider.configure({
  	animation: 'slide',
  	horizontalPosition: 'right',
  	verticalPosition: 'bottom',
  	maxNumber: 0,
  	className: 'info',
  	dismissButton: true,
  });
}])

.controller('RecipesCtrl', ['$scope','$firebase', 'getDBUrl', 'ngToast', function($scope, $firebase, getDBUrl, ngToast) {
	var baseRef = new Firebase(getDBUrl.path);
	var recipeRef = baseRef.child('recipes');
	$scope.recipes = $firebase(recipeRef).$asArray();
	//var itemsRef = baseRef.child('items');
	$scope.items = $firebase(baseRef.child('items')).$asArray();
	$scope.units = $firebase(baseRef.child('units')).$asArray();
	var schedule = $firebase(baseRef.child('schedule')).$asArray();

	$scope.addNewRecipe = false;

	$scope.newRecipe = '';
	$scope.newIngredients = {};
	$scope.newSteps = [];
	$scope.ingredient = '';
	$scope.step = '';
	$scope.selectedRecipe = '';

	$scope.scheduleRecipe = function(recipe, selectedDay) {
		// Need to Add scheduled date to Recipe record in Firebase as well.

		baseRef.child('schedule/' + selectedDay + '/recipe').transaction(function(stock) {
	     	return recipe.$id;
	    }), function(error, committed, snapshot) {
	      if (error) {
	        console.log('Transaction failed abnormally!', error);
	      }
	    };
		ngToast.create(recipe.name + ' added for ' + schedule[selectedDay].name);
	};

	$scope.viewRecipe = function(recipe) {
		$scope.selectedRecipe = recipe;
	};

	$scope.editRecipe = function() {
		$scope.newRecipe = angular.copy($scope.selectedRecipe);
		$scope.newIngredients = $scope.newRecipe.ingredients;
		console.log($scope.newIngredients);
		if ($scope.newIngredients == null) {
			$scope.newIngredients = {};
		}
		$scope.newSteps = $scope.newRecipe.steps;
		if ($scope.newSteps == null) {
			$scope.newSteps = [];
		}
		$scope.addNewRecipe = true;
	};

	$scope.addRecipe = function() {
		var newRecipe = $scope.newRecipe;
		var newIngredients = $scope.newIngredients;
		var newSteps = $scope.newSteps;
		if (!newRecipe.name.length) {
			return;
		}
		newRecipe.ingredients = newIngredients;
		
		var newStep = $scope.step;
		if (newStep != '') {
			newSteps.push({detail: newStep});
		}

		newRecipe.steps = newSteps;
		console.log(newRecipe);
		var newIngredient = $scope.ingredient;
		if (newIngredient != '') {			
			newRecipe.ingredients[newIngredient.item.$id] = {name: newIngredient.item.name, quantity: newIngredient.quantity, uom: newIngredient.uom};
		}

		if ($scope.selectedRecipe != '') {
			//console.log(newRecipe);
			$scope.recipes[$scope.recipes.$indexFor(newRecipe.$id)] = newRecipe;
			$scope.recipes.$save($scope.recipes.$indexFor(newRecipe.$id));
			$scope.selectedRecipe = $scope.recipes[$scope.recipes.$indexFor(newRecipe.$id)];
		} else {
			$scope.recipes.$add(newRecipe);
		}

		$scope.closeAdd();
	};

	$scope.addIngredient = function() {
		var newIngredient = $scope.ingredient;
		if (newIngredient != '') {
			$scope.newIngredients[newIngredient.item.$id] = {name: newIngredient.item.name, quantity: newIngredient.quantity, uom: newIngredient.uom};
			$scope.ingredient = '';
		}
	};

	$scope.addStep = function() {
		var newStep = $scope.step;
		if (newStep != '') {
			$scope.newSteps[$scope.newSteps.length] = {detail: newStep};
			$scope.step = '';	
		}
	};

	$scope.closeAdd = function() {
		$scope.newRecipe = '';
		$scope.ingredient = '';
		$scope.newIngredients = '';
		$scope.step = '';
		$scope.newSteps = '';
		$scope.addNewRecipe = false;
	};
}]);