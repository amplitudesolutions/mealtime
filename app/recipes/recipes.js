'use strict';

angular.module('myApp.recipes', ['myApp.services.recipeService'])

.controller('RecipesCtrl', ['$scope','$firebaseArray', '$q', '_', 'getDBUrl', 'ngToast', 'inventory', 'calendar', 'recipe', 'user', '$uibModal', function($scope, $firebaseArray, $q, _, getDBUrl, ngToast, inventory, calendar, recipe, user, $uibModal) {
	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	// var recipeRef = baseRef.child('recipes');
	$scope.recipes = recipe.get();
	var schedule = calendar.getSchedule();

	$scope.add = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'templates/addRecipeTmpl.html',
			backdrop: true,
			controller: 'addRecipeCtrl',
			size: 'md',
			resolve: {
            	itemId: function() {
            		return null;
            	}
            }
		});
	};

	$scope.view = function(id) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'templates/addRecipeTmpl.html',
			backdrop: true,
			controller: 'addRecipeCtrl',
			size: 'md',
			resolve: {
            	itemId: function() {
            		return id;
            	}
            }
		});
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
	
}])

.controller('addRecipeCtrl', ['$scope', '$uibModalInstance', 'inventory', 'recipe', 'settings', 'itemId', 'ngToast', function($scope, $uibModalInstance, inventory, recipe, settings, itemId, ngToast) {
	$scope.viewMode = true;

	$scope.items = inventory.get();
	$scope.newIngredients = [];
	$scope.newSteps = [];
	$scope.isDeleted = [];
	$scope.units = settings.getUnits();

	if (itemId) {
		$scope.action = "Edit"
		recipe.getRecipe(itemId).then(function(data) {
			$scope.recipe = data;
			if (!angular.isUndefined(data.steps)) {
				$scope.newSteps = data.steps;
			}

			if (!angular.isUndefined(data.ingredients)) {
				$scope.newIngredients = data.ingredients;
			}
		});
	} else {
		$scope.action = "New"
		$scope.recipe = {};
		$scope.viewMode = false;
		// $scope.addAnother();
	}

	$scope.btnAddStep = function() {
		$scope.newSteps.push({detail: $scope.step});
		$scope.step = '';
	};

	$scope.btnRemoveStep = function(index) {
		$scope.newSteps.splice(index, 1);
	};

	$scope.add = function() {
		$scope.recipe.steps = angular.copy($scope.newSteps);
		$scope.recipe.ingredients = angular.copy($scope.newIngredients);
		
		if (!angular.isUndefined($scope.step) && $scope.step != '') {
			$scope.recipe.steps.push({detail: $scope.step});
		};

		if (!angular.isUndefined($scope.ingredient && $scope.ingredient != '')) {
			var newIngredient = {id: '', name: '', quantity: '', uom: ''};
		
			if ($scope.ingredient.name === undefined) {
				newIngredient.$id = '';
				newIngredient.name = $scope.ingredient;
			} else {
				newIngredient = $scope.ingredient;
			}
			newIngredient.quantity = $scope.ingredientItem.quantity;
			newIngredient.uom = $scope.ingredientItem.uom;

			$scope.recipe.ingredients.push(newIngredient);

		};

		angular.forEach($scope.recipe.ingredients, function(value, key){
			if (value.id === '') {
				var item = {};
				item.name = value.name;
				inventory.add(item).then(function(response) {
					$scope.recipe.ingredients[key].id = response.$id;
				})
			}
		});

		if (itemId) {
			recipe.save($scope.recipe).then(function(data) {
				ngToast.create('Recipe saved');
			});
		} else {
			recipe.add($scope.recipe).then(function(data) {
				ngToast.create('Recipe Added');
			});	
		}
		
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.btnAddIngredient = function() {
		var newIngredient = {id: '', name: '', quantity: '', uom: ''};
		if ($scope.ingredient.name === undefined) {
			newIngredient.$id = '';
			newIngredient.name = $scope.ingredient;
		} else {
			newIngredient = $scope.ingredient;
		}
		newIngredient.quantity = $scope.ingredientItem.quantity;
		newIngredient.uom = $scope.ingredientItem.uom;

		$scope.newIngredients.push(newIngredient);

		$scope.ingredient = '';
		$scope.ingredientItem = {quantity: '', uom: ''};
	};

	$scope.btnRemoveIngredient = function(index) {
		$scope.newIngredients.splice(index, 1);
	};	

}])

;