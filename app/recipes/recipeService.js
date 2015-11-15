angular.module('myApp.services.recipeService', [])
	
	.factory('recipe', ['$firebaseArray', 'getDBUrl', 'user', function($firebaseArray, getDBUrl, user) {
	  var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	  var recipes = $firebaseArray(baseRef.child('recipes'));

	  return {
	    get: function() {
	      return recipes;
	    },
	    getRecipe: function(recipeId) {
	      return $firebaseArray(recipesRef.child(id));
	    }
	  }
	}])
;