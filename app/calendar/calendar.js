'use strict';

angular.module('myApp.calendar', ['myApp.services.calendarService'])

	.controller('CalendarCtrl', ['$scope', 'getDBUrl', 'cook', 'user', '$uibModal', 'calendar', 'recipe', function($scope, getDBUrl, cook, user, $uibModal, calendar, recipe) {
		$scope.schedule = calendar.getSchedule();
		$scope.recipes = recipe.get();
		$scope.cooks = cook.getCooks();

		var date = new Date();
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
			//loop through items in the recipe and minus quantity from inventory.

			//set calendar day as complete.
		};

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