angular.module('myApp.services.recipeService', [])
	
	.factory('recipe', ['$q', '$firebaseArray', 'getDBUrl', 'user', function($q, $firebaseArray, getDBUrl, user) {
	  var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	  var recipesRef = baseRef.child('recipes'); // = $firebaseArray(baseRef.child('recipes'));

	  return {
	    get: function() {
	      return $firebaseArray(recipesRef);
	    },
	    getRecipe: function(recipeId) {
	      return $firebaseArray(recipesRef.child(id));
	    },
	    add: function(recipe) {
	    	var deferred = $q.defer();

	        // if (cook.name) {
	          // recipesRef.orderByChild("name").startAt(cook.name).endAt(cook.name).once('value', function(dataSnapshot) {
	            // if (dataSnapshot.val() === null) {
	        deferred.resolve(recipesRef.push(recipe));
	            // } else {
	        // deferred.reject('Issue Creating Cook');
	            // }
	          // });
	        // } else {
	          // deferred.reject('Cook name is blank');
	        // }

	        return deferred.promise;
	    },
	    save: function(recipe) {

	    },
	    delete: function(recipeId) {
	    	 
	    }
	  }
	}])
;