angular.module('myApp.services.recipeService', [])
	
	.factory('recipe', ['$firebaseArray', 'getDBUrl', '$q', 'user', function($firebaseArray, getDBUrl, $q, user) {
	  var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	  var recipes = $firebaseArray(baseRef.child('recipes'));

	  return {
	    get: function() {
	      return recipes;
	    },
	    getRecipe: function(recipeId) {
	      return $firebaseArray(recipesRef.child(id));
	    },
	    add: function(recipe) {
	    	var deferred = $q.defer();

	        // if (item.name) {
	          // itemsRef.orderByChild("name").startAt(item.name).endAt(item.name).once('value', function(dataSnapshot) {
	          //     if (dataSnapshot.val() === null) {
	          //     //Create New Item
	                recipes.$add(recipe).then(function(ref) {         
	                  // categoriesRef.child("/" + defaultCategory + "/items/" + ref.key()).set(true);
	                  deferred.resolve(ref);
	                });
	          //     } else {
	          //       dataSnapshot.forEach(function(snap){
	          //         deferred.resolve(items.$getRecord(snap.key()));
	          //       });
	          //     }
	          // });
	        // } else {
	        //   deferred.reject('Issue retrieving information, please try again.')
	        // }


	    	return deferred.promise;
	    }
	  }
	}])
;