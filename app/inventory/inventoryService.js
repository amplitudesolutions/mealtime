angular.module('myApp.services.inventoryService', [])

  .factory('inventory', ['$q', '$firebaseArray', 'getDBUrl', 'category', 'user', function($q, $firebaseArray, getDBUrl, category, user){
    var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
    
    var listRef = baseRef.child('lists');
    var categoriesRef = baseRef.child('categories');
    var itemsRef = baseRef.child('items');

    var items = $firebaseArray(itemsRef);

    return {
      get: function() {
        return items;
      },
      add: function(item) {
        var deferred = $q.defer();

        var defaultCategory = category.getDefault();
        
        if (item.name) {
          //
          item.searchValue = item.name.toLowerCase();
          item.category = defaultCategory;

          itemsRef.orderByChild("searchValue").startAt(item.searchValue).endAt(item.searchValue).once('value', function(dataSnapshot) {
              if (dataSnapshot.val() === null) {
              //Create New Item
              items.$add(item).then(function(ref) {         
                  categoriesRef.child("/" + defaultCategory + "/items/" + ref.key()).set(true);
                  deferred.resolve(items.$getRecord(ref.key()));
                });
              } else {
                dataSnapshot.forEach(function(snap){
                  deferred.resolve(items.$getRecord(snap.key()));
                });
              }
          });
        } else {
          deferred.reject('Issue retrieving information, please try again.')
        }

        return deferred.promise;
      },
      remove: function(item) {
        var deferred = $q.defer();

        //Delete Item from Inventory
        var category = null;

        itemsRef.child(item.$id).once('value', function(data){
            category = data.val().category;
        });

        itemsRef.child(item.$id).remove(function(error) {
          if (error) {
            deferred.reject(error);
          } else {
            // This is not handled the best, need to figure out.
            categoriesRef.child("/" + category + "/items/" + item.$id).set(null);
            listRef.child("/Default/items/" + item.$id).remove();
  
            deferred.resolve(true);
          }
        });

        return deferred.promise;
      },
      save: function (item) {
        var deferred = $q.defer();

        var name = items[items.$indexFor(item.$id)].name.trim();
        if (name) {
          // Check to see if price is defined, if it isn't, it will throw an error. This is because
          // previous items before this build were added without price.
          if (item.price === undefined)
            item.price = '';

          item.name = name;
          item.searchValue = item.name.toLowerCase();
          
          items.$save(item).then(function(ref) {
            deferred.resolve(ref);
          }, function(error) {
            deferred.reject(error);
          });
        }

        return deferred.promise;
      },
      changeCategory: function(item, category_id) {
        // If category === null then set to default category.
        // var defaultCategory = category.getDefault();

        // if (category_id === null) {
        //   category_id = defaultCategory;
        // };

        itemsRef.child(item.$id + "/category").transaction(function(category) {
          listRef.child('/Default/items/' + item.$id + '/category').transaction(function(category){
            if (category !== null)
              return category_id;
            });

            return category_id;
        }), function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        };
      },
      addStock: function(item, quantity) {
        itemsRef.child(item.$id + "/stock").transaction(function(stock) {
          return stock+quantity;
        }), function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        };
      },
      removeStock: function(item, quantity) {
        //Add Check in here so that you can't go below 0... if Qty is 22 and you subtract that but there is only 10 in there. it will go to -12.
        itemsRef.child(item.$id + "/stock").transaction(function(stock) {
          if (stock != 0) {
            return stock-quantity;
          }
        }), function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        };
      },
      addMinStock: function(item, quantity) {
        itemsRef.child(item.$id + "/minstock").transaction(function(minstock) {
          return minstock+quantity;
        }), function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        };
      },
      removeMinStock: function(item, quantity) {
        //Add Check in here so that you can't go below 0... if Qty is 22 and you subtract that but there is only 10 in there. it will go to -12.
        itemsRef.child(item.$id + "/minstock").transaction(function(minstock) {
          if (minstock != 0) {
            return minstock-quantity;
          }
        }), function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        };
      }

    }
  }])

;