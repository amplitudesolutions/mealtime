angular.module('myApp.controllers', [])

.controller('MainCtrl', ['$scope', 'sideBarNav', 'Auth', 'user', function($scope, sideBarNav, Auth, user) { 
  Auth.$onAuth(function(authData) {
    $scope.signedIn = user.get();
  });

  $scope.sideBarOpen = function() {
    sideBarNav.swipeOpen();
  };

  $scope.sideBarClose = function() {
    sideBarNav.swipeClose();
  };
}])

.controller('MenuCtrl', ['$scope', '$location', 'sideBarNav', 'user', function($scope, $location, sideBarNav, user) {
  $scope.$location = $location;
  $scope.user = user.get();

	$scope.navbarCollapsed = true;

  $scope.sideBarState = function() {
    sideBarNav.toggle();
  };

	$scope.$on('$routeChangeSuccess', function () {
      $scope.navbarCollapsed = true;
  });

  $scope.isActive = function(item) {
  	if (item == $location.path()) {
  		return true;
  	}
  	return false;
  };

  $scope.logout = function() {
    user.logout();
    window.location.href = './login';
    // $location.path("../login");
  };
}])

.controller('InventoryListCtrl', ['$scope', 'sideBarNav', 'user', 'inventory', 'category', function($scope, sideBarNav, user, inventory, category) {
  $scope.inventory = inventory.get();
  $scope.categories = category.get();
 
  $scope.filterText = "";
  $scope.searchitem = "";
  $scope.sideBarState = sideBarNav.state();

  $scope.$watch(function () { return sideBarNav.state(); }, function (newValue) {
    $scope.sideBarState = newValue;
    $scope.menuCategoryStatus.isopen = false;
  });

  $scope.setFilter = function(category) {
    $scope.filterText = category;
    $scope.menuCategoryStatus.isopen = false;
  };
}])

.controller('RecipeBoxCtrl', ['$scope', 'recipe', 'calendar', function($scope, recipe, calendar) {
  $scope.recipes = recipe.get();
  $scope.schedule = calendar.getSchedule();
  $scope.hover = false;
  
  var date = new Date();
  $scope.days = $scope.schedule;

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

  $scope.checkDay = function(day) {
    var date = new Date();
    if (day == date.getDay()) {
      return true;
    }
    return false;
  };

}])

;