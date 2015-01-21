'use strict';

angular.module('myApp.recipes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/recipes', {
    templateUrl: 'recipes/recipes.html',
    controller: 'RecipesCtrl'
  });
}])

.controller('RecipesCtrl', [function() {

}]);