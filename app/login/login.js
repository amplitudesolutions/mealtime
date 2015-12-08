'use strict';

angular.module('myApp.login', [
  'ui.router',
  'ngAnimate',
  'ui.bootstrap',
  'myApp.services',
  'myApp.directives'
])


.controller('LoginCtrl', ['$scope', '$location', '$uibModal', 'user', function($scope, $location, $uibModal, user) {
	$scope.user = '';

	$scope.createGroup = false;

	$scope.signInClick = function() {
		$scope.errorCaught = false;
		$scope.isProcessing = true;
		var userCopy = angular.copy($scope.user);
		userCopy.email += '@mealtime.io'; //or maybe get mealtime.guru
		
		user.login(userCopy).then(function(userObj) {
			window.location.href = "../#/dashboard";
		}).catch(function(error) {
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
		var modalInstance = $uibModal.open({
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
		$scope.createErrorCaught = false;
		$scope.isProcessing = true;
		var create = angular.copy($scope.create);
		create.email += '@mealtime.io'; //or maybe get mealtime.guru

		user.create(create).then(function(createObj) {
			user.login(create).then(function(userObj) {
				$scope.isProcessing = false;
				window.location.href = "../#/dashboard";
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