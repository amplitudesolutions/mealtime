'use strict';

angular.module('myApp.recipes', ['ngRoute', 'ngAnimate'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/recipes', {
    templateUrl: 'recipes/recipes.html',
    controller: 'RecipesCtrl'
  });
}])

.controller('RecipesCtrl', ['$scope','$firebase', 'getDBUrl', function($scope, $firebase, getDBUrl) {
	var baseRef = new Firebase(getDBUrl.path);
	var recipeRef = baseRef.child('recipes');
	$scope.recipes = $firebase(recipeRef).$asArray();
	//var itemsRef = baseRef.child('items');
	$scope.items = $firebase(baseRef.child('items')).$asArray();

	$scope.addNewRecipe = false;

	$scope.newRecipe = '';
	$scope.newIngredients = {};
	$scope.newSteps = [];
	$scope.ingredient = '';
	$scope.step = '';

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

		var newIngredient = $scope.ingredient;
		if (newIngredient != '') {
			newRecipe.ingredients[newIngredient.item.$id] = {name: newIngredient.item.name, quantity: newIngredient.quantity, uom: newIngredient.uom};
		}

		$scope.recipes.$add(newRecipe);

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