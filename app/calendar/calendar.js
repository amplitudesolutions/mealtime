'use strict';

angular.module('myApp.calendar', ['ui.router', 'ngAnimate'])

.controller('CalendarCtrl', ['$scope', '$firebase', 'getDBUrl', 'user', function($scope, $firebase, getDBUrl, user) {

	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);

	$scope.schedule = $firebase(baseRef.child('schedule')).$asArray();
	$scope.recipes = $firebase(baseRef.child('recipes')).$asArray();

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

	$scope.checkDay = function(day) {
		var date = new Date();
		if (day == date.getDay()) {
			return true;
		}
		return false;
	};
}]);