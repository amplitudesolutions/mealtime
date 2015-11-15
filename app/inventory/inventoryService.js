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
          itemsRef.orderByChild("name").startAt(item.name).endAt(item.name).once('value', function(dataSnapshot) {
              if (dataSnapshot.val() === null) {
              //Create New Item
                items.$add({ name: item.name, category: defaultCategory, stock: 0, minstock: 0}).then(function(ref) {         
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
        //Delete Item from Inventory
        var category = null;

        itemsRef.child(item.$id).once('value', function(data){
            category = data.val().category;
        });

        categoriesRef.child("/" + category + "/items/" + item.$id).set(null);
        listRef.child("/Default/items/" + item.$id).remove();
        itemsRef.child(item.$id).remove();
      },
      save: function (item) {
        var name = items[items.$indexFor(item.$id)].name.trim();
        if (name) {
          item.name = name;
          items.$save(item);
        }
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