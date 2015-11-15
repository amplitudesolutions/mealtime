'use strict';

angular.module('myApp.settings', ['myApp.services.settingsService'])

.controller('SettingsCtrl', [function() {

}])

.controller('SettingGeneralCtrl', ['$scope','$firebaseArray', '$firebaseObject', 'getDBUrl', 'ngToast', 'settings', 'list', function($scope, $firebaseArray, $firebaseObject, getDBUrl, ngToast, settings, list) {
	$scope.settings = settings.getGeneral();
	$scope.lists = list.get();
}])

.controller('SettingUnitCtrl', ['$scope','$firebaseArray', 'getDBUrl', 'ngToast', 'settings', function($scope, $firebaseArray, getDBUrl, ngToast, settings) {
	$scope.units = settings.getUnits();
	$scope.newUnit = "";

	$scope.addUnit = function() {
		if ($scope.newUnit) {
			settings.addUnit($scope.newUnit).then(function(data) {
				ngToast.create('<b>' + $scope.newUnit + '</b> has been added');
				$scope.newUnit = "";
			});
		}
	};
}])


;