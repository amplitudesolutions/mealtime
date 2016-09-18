angular.module('myApp.services.recipeService', [])
	
	.factory('recipe', ['$firebaseArray', '$firebaseObject', 'getDBUrl', '$q', 'user', function($firebaseArray, $firebaseObject, getDBUrl, $q, user) {
	  var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
	  var recipes = $firebaseArray(baseRef.child('recipes'));

	  return {
	    get: function() {
	      return recipes;
	    },
	    getRecipe: function(recipeId) {
	    	var deferred = $q.defer();

	    	var recipe = $firebaseObject(baseRef.child("recipes").child(recipeId));

	    	recipe.$loaded().then(function(data) {
	    		deferred.resolve(data);
	    	}).catch(function(error) {
	    		deferred.reject(error);
	    	});
	      	
	      	return deferred.promise;
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
	    },
	    save: function(recipe) {
	    	var deferred = $q.defer();
			recipe.$save().then(function(ref) {
				deferred.resolve(ref);
			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise;
	    },
	    remove: function(item) {
	    	var deferred = $q.defer();

	    	baseRef.child('recipes').child(item.$id).remove(function(error) {
	    		if (error)
	    			deferred.reject(error);
	    		else
	    			deferred.resolve(true);
	    	});

	    	return deferred.promise;
	    	
	      }
	  }
	}])
;