'use strict';

angular.module('myApp.settings', ['ngRoute', 'ngAnimate', 'ngToast'])

.config(['$routeProvider', 'ngToastProvider', function($routeProvider, ngToastProvider) {
  $routeProvider.when('/settings', {
    templateUrl: 'settings/settings.html',
    controller: 'SettingsCtrl',
    resolve: {
	    // controller will not be loaded until $waitForAuth resolves
	    // Auth refers to our $firebaseAuth wrapper in the example above
	    "currentAuth": ["Auth", function(Auth) {
	      // $waitForAuth returns a promise so the resolve waits for it to complete]\
	      return Auth.$requireAuth();
	    }]
	}
  });
  ngToastProvider.configure({
  	animation: 'slide',
  	horizontalPosition: 'right',
  	verticalPosition: 'bottom',
  	maxNumber: 0,
  	className: 'info',
  	dismissButton: true,
  });
}])

.controller('SettingsCtrl', ['$scope','$firebase', 'getDBUrl', 'ngToast', 'user', function($scope, $firebase, getDBUrl, ngToast, user) {
	var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	var settingsRef = baseRef.child('settings');
	var listRef = baseRef.child('lists');
	var unitsRef = baseRef.child('units');

	$scope.settings = $firebase(settingsRef).$asObject();
	$scope.lists = $firebase(listRef).$asArray();
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

	$scope.removeUnit = function(unit) {
		// Will need to check if any inventory items use this, if not, then can be removed.
		$scope.units.$remove(unit);
		ngToast.create('<b>' + unit.name + '</b> has been removed');
	};

}]);