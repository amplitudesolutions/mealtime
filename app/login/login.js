'use strict';

angular.module('myApp.login', ['ngRoute', 'ngAnimate'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'LoginCtrl',
    resolve: {
	    // controller will not be loaded until $waitForAuth resolves
	    // Auth refers to our $firebaseAuth wrapper in the example above
	    "currentAuth": ["Auth", function(Auth) {
	      // $waitForAuth returns a promise so the resolve waits for it to complete
	      return Auth.$waitForAuth();
	    }]
  	}
  });
}])

.controller('LoginCtrl', ['$scope', '$location', '$modal', 'user', function($scope, $location, $modal, user) {
	$scope.user = '';

	$scope.createGroup = false;

	$scope.signInClick = function() {
		$scope.isProcessing = true;
		var userCopy = angular.copy($scope.user);
		userCopy.email += '@mealtime.io'; //or maybe get mealtime.guru
		
		user.login(userCopy).then(function(userObj) {
			window.location.href = "#/dashboard";
		}).catch(function(error) {
			// Need to show error message on screen indicating error. ie) Bad username or password
			$scope.errorCaught = false;

			switch(error.code) {
				case "INVALID_EMAIL":
					$scope.errorCaught = true;
					break;
				case "INVALID_PASSWORD":
					$scope.errorCaught = true;
					break;
				case "INVALID_USER":
					$scope.errorCaught = true;
					break;
				default:
					console.log(error);
			}
			$scope.isProcessing = false;
		});
	};

	$scope.forgotPassword = function() {
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			size: 'sm',
			resolve: {
				items: function () {
					return $scope.items;
	        	}
			}
	    });

	    modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
	    });
	};

	$scope.createGroupClick = function() {
		$scope.isProcessing = true;
		var create = angular.copy($scope.create);
		create.email += '@mealtime.io'; //or maybe get mealtime.guru

		user.create(create).then(function(createObj) {
			user.login(create).then(function(userObj) {
				$scope.isProcessing = false;
				window.location.href = "#/dashboard";
			})
		}).catch(function(error) {
			switch(error.code) {
				case "INVALID_EMAIL":
					$scope.createErrorCaught = true;
					break;
				case "EMAIL_TAKEN":
					$scope.createErrorCaught = true;
					break;
				default:
					console.log(error);
			}
			$scope.isProcessing = false;
		});
	};

	$scope.checkGroupName = function() {

	};
}])

.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;

  $scope.ok = function () {
    // $modalInstance.close($scope.selected.item);
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

;