angular.module('myApp.services.calendarService', [])

  .factory('calendar', ['$firebaseArray', 'getDBUrl', 'list', 'user', function($firebaseArray, getDBUrl, list, user){
    var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
    var scheduleRef = baseRef.child('schedule');
    var schedule = $firebaseArray(scheduleRef);

    return {
      getSchedule: function() {
        return schedule;
      },
      addScheduleItem: function(day, recipe) {
        // Need to add promise in here.
        
      },
      addItemsToList: function(recipe) {
        // Add's recipe items to the grocery list
        // Need to check current inventory and adjust accordingly
        angular.forEach(recipe.ingredients, function(value, key) {
          var itemsRef = baseRef.child('items/' + key);
          itemsRef.once('value', function(dataSnap) {
            //Get items from Recipe and add them to the grocery list.
            var item = {};
            item = dataSnap.val();
            item.$id = dataSnap.key();
            list.add(item);
          })
        })
      },
      removeItemsFromList: function(recipe) {
        // If the user changes recipes, removes a recipe from one of the days, need to update the inventory.

      },
      markComplete: function() {
        
      },
      selectCook: function(cook, day) {
        scheduleRef.child(day.$id + "/cook").transaction(function(currentCook) {
          return cook.$id;
        });
      }
    };

  }])

  .factory('cook', ['$q', '$firebaseArray', '$firebaseObject', 'getDBUrl', 'user', function($q, $firebaseArray, $firebaseObject, getDBUrl, user) {
    var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
    var cookRef = baseRef.child('cooks');

    return {
      getCooks: function() {
        return $firebaseArray(cookRef);
      },
      addCook: function(cook) {
        var deferred = $q.defer();

        if (cook.name) {
          cookRef.orderByChild("name").startAt(cook.name).endAt(cook.name).once('value', function(dataSnapshot) {
            if (dataSnapshot.val() === null) {
              deferred.resolve(cookRef.push(cook));
            } else {
              deferred.reject('Issue Creating Cook');
            }
          });
        } else {
          deferred.reject('Cook name is blank');
        }

        return deferred.promise;
      },
      getCook: function(cookId) {
        var cookRef = baseRef.child('cooks/' + cookId);
        return $firebaseObject(cookRef);
      }
    };
  }])

;