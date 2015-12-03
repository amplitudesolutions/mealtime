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
	$scope.newIngredient = '';
	$scope.recipe = {};
	$scope.recipe.steps = [];
	$scope.recipe.ingredients = [];
	$scope.newStep = '';
	$scope.units = settings.getUnits();

	var addStep = function(newStep) {
		if (newStep != '') {
			$scope.recipe.steps.push({detail: newStep});
		}
	};

	var removeStep = function(step) {
		$scope.recipe.steps.splice($scope.recipe.steps.indexOf(step), 1);
	};

	var removeIngredient = function(ingredient) {
		delete $scope.newIngredients[_.findKey($scope.newIngredients, {'name': ingredient.name})];
	};	

	var addIngredient = function() {

		// If object, then it already exists in inventory
		if (typeof $scope.newIngredient.name === 'object') {
			$scope.newIngredient.id = $scope.newIngredient.name.$id;
			$scope.newIngredient.name = $scope.newIngredient.name.name;
		}

		$scope.recipe.ingredients.push({id: $scope.newIngredient.id, name: $scope.newIngredient.name, directions: $scope.newIngredient.directions, quantity: $scope.newIngredient.quantity, uom: $scope.newIngredient.uom});

	};

	$scope.btnAddStep = function() {
		addStep($scope.newStep);
		$scope.newStep = '';
	};

	$scope.btnRemoveStep = function(step) {
		removeStep(step);
	};

	$scope.btnAddIngredient = function() {
		addIngredient($scope.newIngredient);
		$scope.newIngredient.name = '';
		$scope.newIngredient.directions = '';
		$scope.newIngredient.quantity = '';
		$scope.newIngredient.uom = '';
	};

	$scope.btnRemoveIngredient = function(ingredient) {
		removeIngredient(ingredient);
	};

	$scope.add = function() {
		addStep($scope.newStep);
		addIngredient($scope.newIngredient);

		angular.forEach($scope.recipe.ingredients, function(value, key) {
			//Add undefined inventory
			
			if (angular.isUndefined(value.id)) {
				console.log(value.id);
				inventory.add(value).then(function(response) {
					console.log(key + '-' + value);
					if (response != '') {
						$scope.recipe.ingredients[key] = {id: response.$id, name: value.name, directions: value.directions, quantity: value.quantity, uom: value.uom };
					}
				}, function (reason) {
					console.log(reason);
				});
			}

			//$scope.recipe.ingredient[$scope.recipe.ingredients[key].id] = {name: value.name, directions: value.directions, quantity: value.quantity, uom: value.uom};
		});
		console.log($scope.recipe);
		//$uibModalInstance.close(recipe.add($scope.recipe));
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
}])

;