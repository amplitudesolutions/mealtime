'use strict';

angular.module('myApp.list', ['ngRoute', 'ngAnimate'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/list/:listId', {
    templateUrl: 'recipes/list.html',
    controller: 'ListCtrl'
  });
}])

.controller('ListCtrl', [function() {

}]);