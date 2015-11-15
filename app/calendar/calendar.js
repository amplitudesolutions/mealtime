'use strict';

angular.module('myApp.calendar', ['ui.router', 'ngAnimate'])

.controller('CalendarCtrl', ['$scope', '$firebase', 'getDBUrl', 'cook', 'user', '$uibModal', 'calendar', function($scope, $firebase, getDBUrl, cook, user, $uibModal, calendar) {

	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);

	$scope.schedule = calendar.getSchedule();
	$scope.recipes = $firebase(baseRef.child('recipes')).$asArray();
	$scope.cooks = cook.getCooks();

	var date = new Date();
	// $scope.currentDay = date.getDay();
	$scope.days = $scope.schedule;

	// var date = new Date();
	var today = date.getDay();

	var index = today;
	var dayOrder = [];

	$scope.days.$loaded().then(function(days){
		for (var i = 0; i < days.length; i++) {
			dayOrder.push($scope.days[index]);
			if (index == 6) {
				index = -1;
			}
			index ++
		}
		$scope.days = dayOrder;
	});

	$scope.completeClick = function(day) {
		//Need to remove items from inventory and then remove from calendar list.
		
		//Grab the recipe selected for that day.
		var recipe = $firebase(baseRef.child('recipes').child(id)).$asArray();

		//loop through items in the recipe and minus quantity from inventory.

		//set calendar day as complete.
	};
	
	// $scope.getRecipe = function(id) {
	// 	var recipe = $firebase(baseRef.child('recipes').child(id)).$asArray();
	// 	//console.log(recipe);
	// 	//return recipe.name;
	// };

	$scope.selectCook = function(cook, day) {
		calendar.selectCook(cook, day);
	};

	$scope.addCook = function(day) {
		var modalInstance = $uibModal.open({
			animation:false,
			templateUrl: 'templates/addCookTmpl.html',
			controller: 'addCookCtrl',
			size: 'sm'
		});

		modalInstance.result.then(function (addedCook) {
			calendar.selectCook(cook.getCook(addedCook), day);
		});
	};

	$scope.checkDay = function(day) {
		var date = new Date();
		if (day == date.getDay()) {
			return true;
		}
		return false;
	};
}])

.controller('addCookCtrl', ['$scope', '$modalInstance', 'cook', function($scope, $modalInstance, cook) {
	$scope.cook = {};
	$scope.cook.color = '40b3ff';
	$scope.add = function() {
		$modalInstance.close(cook.addCook($scope.cook));
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.selectColor = function(selectedColor) {
		$scope.cook.color = selectedColor;
	};
}])
;
