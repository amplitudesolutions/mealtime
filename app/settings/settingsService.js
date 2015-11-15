angular.module('myApp.services.settingsService', [])
	
	.factory('settings', ['$q', '$firebaseArray', '$firebaseObject', 'getDBUrl', 'user', function($q, $firebaseArray, $firebaseObject, getDBUrl, user) {
		var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
		var settingsRef = baseRef.child('settings');
		var unitsRef = baseRef.child('units');

		return {
		    getGeneral: function() {
		      return $firebaseObject(settingsRef);
		    },
		    getUnits: function(recipeId) {
		      return $firebaseArray(unitsRef);
		    },
		    getGroup: function() {
		    	return 1;
		    },
		    addUnit: function(unit) {
		    	var deferred = $q.defer();

		    	unitsRef.orderByChild("name").startAt(unit).endAt(unit).once('value', function(dataSnapshot) {
			      	if (dataSnapshot.val() === null) {
				        deferred.resolve(unitsRef.push({name: unit}));
			      	} else {
		    			deferred.reject('Issue Creating Unit');
			      	}
		    	});

		    	return deferred.promise;
		    }
		  }
	}])
;