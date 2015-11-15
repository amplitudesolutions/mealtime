angular.module('myApp.services.recipeService', [])
	
	.factory('recipe', ['$firebase', 'getDBUrl', 'user', function($firebase, getDBUrl, user) {
	  var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	  var recipesRef = baseRef.child('recipes');
	  var recipes = $firebase(recipesRef).$asArray();

	  return {
	    get: function() {
	      return recipes;
	    },
	    getRecipe: function(recipeId) {
	      return $firebase(recipesRef.child(id)).$asArray();
	    }
	  }
	}])

;