'use strict';

angular.module('myApp.calendar', ['ngRoute', 'ngAnimate'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/calendar', {
    templateUrl: 'calendar/calendar.html',
    controller: 'CalendarCtrl'
  });
}])

.controller('CalendarCtrl', ['$scope', '$firebase', 'getDBUrl', function($scope, $firebase, getDBUrl) {

	var baseRef = new Firebase(getDBUrl.path);

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
	
	$scope.getRecipe = function(id) {
		var recipe = $firebase(baseRef.child('recipes').child(id)).$asArray();
		console.log(recipe);
		//return recipe.name;
	};

	$scope.checkDay = function(day) {
		var date = new Date();
		if (day == date.getDay()) {
			return true;
		}
		return false;
	};
}]);