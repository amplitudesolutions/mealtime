'use strict';

angular.module('myApp.recipes', ['myApp.services.recipeService'])

.controller('RecipesCtrl', ['$scope','$firebaseArray', '$q', '_', 'getDBUrl', 'ngToast', 'inventory', 'calendar', 'recipe', 'user', '$uibModal', function($scope, $firebaseArray, $q, _, getDBUrl, ngToast, inventory, calendar, recipe, user, $uibModal) {
	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	var recipeRef = baseRef.child('recipes');
	$scope.recipes = recipe.get();
	$scope.items = inventory.get();
	$scope.units = $firebaseArray(baseRef.child('units'));
	var schedule = calendar.getSchedule();

	$scope.ingredient = '';
	$scope.ingredientItem = '';

	$scope.recipe = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'templates/addRecipeTmpl.html',
			backdrop: true,
			controller: 'addRecipeCtrl',
			size: 'md'
		});

		// modalInstance.result.then(function (addedRecipe) {
		// 	calendar.selectCook(cook.getCook(addedCook), day);
		// });
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

.controller('addRecipeCtrl', ['$scope', '$uibModalInstance', 'inventory', 'recipe', 'settings', function($scope, $uibModalInstance, inventory, recipe, settings) {
	$scope.items = inventory.get();
	$scope.newIngredients = {};
	$scope.ingredientItem = '';
	$scope.newSteps = [];
	$scope.newStep = '';
	$scope.units = settings.getUnits();

	var addStep = function(newStep) {
		if (newStep != '') {
			$scope.newSteps.push({detail: newStep});
		}
	};

	var removeStep = function(step) {
		$scope.newSteps.splice($scope.newSteps.indexOf(step), 1);
	};

	var removeIngredient = function(ingredient) {
		delete $scope.newIngredients[_.findKey($scope.newIngredients, {'name': ingredient.name})];
	};	

	var addIngredient = function() {
		console.log($scope.ingredientItem);
		var newIngredient = {};
		if ($scope.ingredientItem != '') {
			if ($scope.ingredientItem.name === undefined) {
				newIngredient.name = $scope.ingredientItem.name;
			} else {
				newIngredient = $scope.ingredientItem.name;
			}

			newIngredient.quantity = $scope.ingredientItem.quantity;
			newIngredient.uom = $scope.ingredientItem.uom;

			// Need to check current inventory levels and what is current scheduled for the week and adjust qty on
			// grocery list as needed.

			inventory.add(newIngredient).then(function(response) {
				if (response != '') {
					$scope.newIngredients[response.$id] = {name: response.name, quantity: newIngredient.quantity, uom: newIngredient.uom};
				}
			}, function (reason) {
				console.log(reason);
			});
		}
	};

	$scope.btnAddStep = function() {
		addStep($scope.newStep);
		$scope.newStep = '';
	};

	$scope.btnRemoveStep = function(step) {
		removeStep(step);
	};

	$scope.btnAddIngredient = function() {
		addIngredient($scope.ingredientItem);
		$scope.ingredient = '';
		$scope.ingredientItem = '';
	};

	$scope.btnRemoveIngredient = function(ingredient) {
		removeIngredient(ingredient);
	};

	$scope.add = function() {
		//$modalInstance.close(cook.addCook($scope.cook));
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
}])

;