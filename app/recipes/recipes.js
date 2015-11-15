'use strict';

angular.module('myApp.recipes', ['ui.router', 'ngAnimate', 'ngToast'])

.controller('RecipesCtrl', ['$scope','$firebase', '$q', '_', 'getDBUrl', 'ngToast', 'inventory', 'calendar', 'user', function($scope, $firebase, $q, _, getDBUrl, ngToast, inventory, calendar, user) {
	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
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
	$scope.step = '';

	$scope.ingredient = '';
	$scope.ingredientItem = '';

	$scope.selectedRecipe = '';


	$scope.recipe = function() {
		// var modalInstance = $
	};



	$scope.scheduleRecipe = function(recipe, selectedDay) {
		// Need to Add scheduled date to Recipe record in Firebase as well.

		var scheduleDate = Firebase.ServerValue.TIMESTAMP;

		baseRef.child('schedule/' + selectedDay + '/recipe').transaction(function() {
			// Need to get also remove the previous recipes items if they were added to the grocery list.
			calendar.addItemsToList(recipe);
	     	return recipe.$id;
	    });

	    baseRef.child('schedule/' + selectedDay + '/lastupdated').transaction(function() {
	    	return scheduleDate;
	    });
	    
	    // , function(error, committed, snapshot) {
	    //   if (error) {
	    //     console.log('Transaction failed abnormally!', error);
	    //   }
	    // };
		ngToast.create(recipe.name + ' added for ' + schedule[selectedDay].name);
	};

	$scope.viewRecipe = function(recipe) {
		$scope.selectedRecipe = recipe;
	};

	$scope.editRecipe = function() {
		$scope.newRecipe = angular.copy($scope.selectedRecipe);
		$scope.newIngredients = $scope.newRecipe.ingredients;

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
		createRecipe().then(function(response) {
			if ($scope.selectedRecipe != '') {
				$scope.recipes[$scope.recipes.$indexFor(response.$id)] = response;
				$scope.recipes.$save($scope.recipes.$indexFor(response.$id));
				$scope.selectedRecipe = $scope.recipes[$scope.recipes.$indexFor(response.$id)];
			} else {
				$scope.recipes.$add(response);
			}

			$scope.closeAdd();
		});
		
	};

	var addStep = function(newStep) {
		var deferred = $q.defer();
		if (newStep != '') {
			$scope.newSteps.push({detail: newStep});
			deferred.resolve('Success');
		}
		return deferred.promise;
	};

	var removeStep = function(step) {
		var deferred = $q.defer();

		$scope.newSteps.splice($scope.newSteps.indexOf(step), 1);
		deferred.resolve('Success');

		return deferred.promise;
	};

	var removeIngredient = function(ingredient) {
		var deferred = $q.defer();
		delete $scope.newIngredients[_.findKey($scope.newIngredients, {'name': ingredient.name})];

		deferred.resolve('Success');

		return deferred.promise;
	};	

	var addIngredient = function() {
		var deferred = $q.defer();

		var newIngredient = {};
		if ($scope.ingredient.name === undefined) {
			newIngredient.name = $scope.ingredient;
		} else {
			newIngredient = $scope.ingredient;
		}

		newIngredient.quantity = $scope.ingredientItem.quantity;
		newIngredient.uom = $scope.ingredientItem.uom;

		// Need to check current inventory levels and what is current scheduled for the week and adjust qty on
		// grocery list as needed.

		inventory.add(newIngredient).then(function(response) {
			if (response != '') {
				$scope.newIngredients[response.$id] = {name: response.name, quantity: newIngredient.quantity, uom: newIngredient.uom};
				deferred.resolve(response);
			}
		}, function (reason) {
			console.log(reason);
		});

		return deferred.promise;
	};
	
	var createRecipe = function () {
		var deferred = $q.defer();

		var newRecipe = $scope.newRecipe;

		var newStep = $scope.step;
		if (newStep != '') {
			var p1 = addStep(newStep);
		}
		
		var newIngredient = $scope.ingredient;
		if (newIngredient != '') {
			var p2 = addIngredient();
		}

		$q.all([p1, p2]).then(function(data){
			newRecipe.ingredients = $scope.newIngredients;
			newRecipe.steps = $scope.newSteps;

			deferred.resolve(newRecipe);
		});

		return deferred.promise;
	};

	$scope.btnRemoveStep = function(step) {
		removeStep(step).then(function(response) {
			ngToast.create('Step removed UNDO');
		});
	};

	$scope.btnRemoveIngredient = function(ingredient) {
		removeIngredient(ingredient).then(function(response) {
			ngToast.create(ingredient.name + ' removed UNDO');
		});
	};

	$scope.btnAddIngredient = function() {
		addIngredient().then(function(response){
			$scope.ingredient = '';
			$scope.ingredientItem = '';
		});
	};

	$scope.btnAddStep = function() {
		addStep($scope.step);
		$scope.step = '';
	};

	$scope.closeAdd = function() {
		$scope.newRecipe = '';
		$scope.ingredient = '';
		$scope.newIngredients = {};
		$scope.ingredientItem = '';
		$scope.step = '';
		$scope.newSteps = [];
		$scope.addNewRecipe = false;
	};
}])

.factory('recipe', ['$q', '$firebase', 'getDBUrl', 'inventory', 'user', function($q, $firebase, getDBUrl, inventory, user){
  	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	var recipeRef = baseRef.child('recipes');
	var recipes = $firebase(recipeRef).$asArray();


	return {
	  	get: function() {
	  		return recipes;
	  	},
	  	addRecipe: function(recipe) {

	  	},
	  	addStep: function() {

		},
	  	addIngredient: function() {
			var deferred = $q.defer();
			
			
			return deferred.promise;
	  	}
	}
}])

;