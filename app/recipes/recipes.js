'use strict';

angular.module('myApp.recipes', ['ngRoute'])

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
	
	$scope.newRecipe = '';
	$scope.newIngredients = {};
	$scope.ingredient = '';

	$scope.addRecipe = function() {
		var newRecipe = $scope.newRecipe;
		var newIngredients = $scope.newIngredients;
		if (!newRecipe.name.length) {
			return;
		}
		newRecipe.ingredients = newIngredients;

		var newIngredient = $scope.ingredient;
		if (newIngredient != '') {
			newRecipe.ingredients[newIngredient.item.$id] = {name: newIngredient.item.name, quantity: newIngredient.quantity, uom: newIngredient.uom};
		}
		
		$scope.recipes.$add(newRecipe);

		$scope.newRecipe = '';
		$scope.ingredient = '';
		$scope.newIngredients = '';
	};

	$scope.addIngredient = function() {
		var newIngredient = $scope.ingredient;
		if (newIngredient != '') {
			console.log(newIngredient);
			$scope.newIngredients[newIngredient.item.$id] = {name: newIngredient.item.name, quantity: newIngredient.quantity, uom: newIngredient.uom};
			$scope.ingredient = '';
		}
	};

	$scope.addStep = function() {

	};
}]);