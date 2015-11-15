angular.module('myApp.services', ['firebase'])

  .factory('getDBUrl', ['$location', function($location) {
    var dbURL = null;
    if ($location.host() == 'localhost' || $location.host() == 'mealtimedev.firebaseapp.com') {
      // DEV DB
        dbURL = "https://mealtimedev.firebaseio.com";
    // } else if ($location.host() == 'intense-inferno-9799.firebaseapp.com') {
    } else if ($location.host() == 'mealtimeprod.firebaseapp.com') {
      dbURL = "https://mealtimeprod.firebaseio.com";
    }
    
    return {path: dbURL};
  }])


  .factory('Auth', ['$firebaseAuth', 'getDBUrl', function($firebaseAuth, getDBUrl) {
      var ref = new Firebase(getDBUrl.path);
      return $firebaseAuth(ref);
    }
  ])

  .factory('user', ['$q', 'Auth', '$firebase', 'getDBUrl', function($q, Auth, $firebase, getDBUrl) {

    // Used to setup any defaults for the user in firebase.
    function setupUser(user, email) {
      var baseRef = new Firebase(getDBUrl.path + '/' + user.uid);

      baseRef.once("value", function(snapshot) {
        if (!snapshot.exists()) {

          // Initial Setup of Default Values on first login.
          
          // Setup Default Category
          baseRef.child("categories").push({color: 'default', default: true, name: 'Default Category'})

          // Setup Default List
          // Will worry about it when I add multiple list support for users.

          // Setup Default Settings
          baseRef.child('settings').set({defaultlist: 'Default', uom: 'metric', email: email});
          // Check to see if email is part of user object, if not, don't bother adding it just yet.

          // Setup Receipe Schedule
          var scheduleRef = baseRef.child('schedule');
          scheduleRef.child(0).set({abbrev: 'Su', name: 'Sunday'});
          scheduleRef.child(1).set({abbrev: 'M', name: 'Monday'});
          scheduleRef.child(2).set({abbrev: 'T', name: 'Tuesday'});
          scheduleRef.child(3).set({abbrev: 'W', name: 'Wednesday'});
          scheduleRef.child(4).set({abbrev: 'Th', name: 'Thursday'});
          scheduleRef.child(5).set({abbrev: 'F', name: 'Friday'});
          scheduleRef.child(6).set({abbrev: 'S', name: 'Saturday'});
        }
      });
    }

    return {
      get: function() {
        return Auth.$getAuth();
      },
      login: function(user) {
        var deferred = $q.defer();

        Auth.$authWithPassword(user).then(function(authData) {
          setupUser(authData, user.group);

          deferred.resolve(authData);
        }).catch(function(error) {
          deferred.reject(error);
        });

        return deferred.promise;
      },
      logout: function() {
        return Auth.$unauth();
      },
      create: function(user) {
        var deferred = $q.defer();

        Auth.$createUser(user).then(function(userData) {
          deferred.resolve(userData);
        }).catch(function(error){
          deferred.reject(error);
        });

        return deferred.promise;
      }
    }
  }])

  .factory('sideBarNav', [function() {
    var isOpen = false;

    return {
      swipeOpen: function() {
        isOpen = true;
      },
      swipeClose: function() {
        isOpen = false;
      },
      toggle: function() {
        isOpen = !isOpen;
      },
      state: function() {
        // console.log(isOpen);
        return isOpen;
      }
    };

  }])
;
