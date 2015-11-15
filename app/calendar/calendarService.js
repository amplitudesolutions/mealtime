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

  .factory('cook', ['$firebaseArray', 'getDBUrl', 'user', function($firebaseArray, getDBUrl, user) {
    var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);

    return {
      getCooks: function() {
        var cookRef = baseRef.child('cooks');
        var cooks = $firebaseArray(cookRef);

        return cooks;
      },
      addCook: function(cook) {
        var cookRef = baseRef.child('cooks');
        var addedCook = cookRef.push(cook);
        return addedCook.key();
      },
      getCook: function(cookId) {
        var cookRef = baseRef.child('cooks/' + cookId);
        return $firebaseArray(cookRef);
      }
    };
  }])

;