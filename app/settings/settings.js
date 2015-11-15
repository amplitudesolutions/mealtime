'use strict';

angular.module('myApp.settings', ['ui.router', 'ngAnimate', 'ngToast'])

.controller('SettingsCtrl', [function() {

}])

.controller('SettingGeneralCtrl', ['$scope','$firebase', 'getDBUrl', 'ngToast', 'user', function($scope, $firebase, getDBUrl, ngToast, user) {
	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	var settingsRef = baseRef.child('settings');
	var listRef = baseRef.child('lists');

	$scope.settings = $firebase(settingsRef).$asObject();
	$scope.lists = $firebase(listRef).$asArray();
}])

.controller('SettingUnitCtrl', ['$scope','$firebase', 'getDBUrl', 'ngToast', 'user', function($scope, $firebase, getDBUrl, ngToast, user) {
	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	var unitsRef = baseRef.child('units');

	$scope.units = $firebase(unitsRef).$asArray();
	$scope.newUnit = "";

	$scope.addUnit = function() {
		if ($scope.newUnit) {

		    unitsRef.orderByChild("name").startAt($scope.newUnit).endAt($scope.newUnit).once('value', function(dataSnapshot) {
		      	if (dataSnapshot.val() === null) {
			    	//Create New Item
			        $scope.units.$add({ name: $scope.newUnit }).then(function(ref) {         
			      		ngToast.create('<b>' + $scope.newUnit + '</b> has been added');
			          	$scope.newUnit = "";
			        });
		      	} else {
			     //  	dataSnapshot.forEach(function(snap){
				    // 	$scope.itemExists = $scope.items.$getRecord(snap.key()).$id;
				    // });
		      	}
		    });

		}
	};
}])


;