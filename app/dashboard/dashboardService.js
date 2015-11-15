 angular.module('myApp.services.dashboardService', [])

  .factory('category', ['$firebaseArray', 'getDBUrl', 'user', function($firebaseArray, getDBUrl, user){
    var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
    var categoriesRef = baseRef.child('categories');
    var categories = $firebaseArray(categoriesRef);

    function setDefault(category) {
      category.child('default').set(true);
    }

    function defaultCategory() {
      var returnData = null;
      categoriesRef.orderByChild('default').startAt(true).endAt(true).once('value', function(snap) {
        snap.forEach(function(snapData) {
          returnData = snapData.key();
        });
      });

      return returnData;
    }
    
    return {
      getDefault: function() {
        return defaultCategory();
      },
      setDefault: function(category) {
        setDefault(category);
      },
      get: function() {
        return categories;
      },
      add: function(category) {
        categories.$add({ name: category.name, color: category.color }).then(function(ref) {
          if (categories.length == 1) {
            setDefault(ref);
          }
        });
      },
      save: function(category) {
        var name = category.name.trim();
        if (name) {
          category.name = name;
          var cat = categories.$indexFor(category.$id);
          categories[cat] = category;
          categories.$save(cat);
         }
      },
      delete: function(category) {
        // Check to see if items exist in the category

        // If there is, move them to the default category
        // Get Default Category
        var itemRef = '';
        var listItemRef = '';
        var itemsRef = baseRef.child('items');
        itemsRef.orderByChild('category').startAt(category.$id).endAt(category.$id).once('value', function(snapShot) {
          snapShot.forEach(function(data) {
            itemRef = baseRef.child('items/' + data.key() + '/category');
            itemRef.transaction(function(currentCategory) {
              return defaultCategory();
            });

            listItemRef = baseRef.child('lists/Default/items/' + data.key() + '/category');
            listItemRef.transaction(function(currentCategory) {
              return defaultCategory();
            });
          })
        });

        categoriesRef.child(category.$id).remove();
      }
    }

  }])

 .factory('list', ['$firebaseArray', 'getDBUrl', 'inventory', 'user', function($firebaseArray, getDBUrl, inventory, user){
    var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);
    var listRef = baseRef.child('lists/Default');
    var itemsRef = baseRef.child('items');
    var transactions = baseRef.child("transactions");
    
    var list = $firebaseArray(listRef);
    var listItems = $firebaseArray(listRef.child('items'));


    function removeItem(item) {
      listItems.$remove(item);
    }

    return {
      get: function() {
        return list;
      },
      getListItems: function() {
        return listItems;
      },
      addToCart: function(item) {
        //This is used when the checkbox of an item is checked and then added to "In your basket"
        var listItemRef = listRef.child("/items");
        //Check if item exists, if not create it.
        listItemRef.child(item.$id + "/gotit").transaction(function(gotit){
          if (gotit !== null) {
          //     //Item in list.. need to tell them
          // } else {
            //Add a Transaction
            var purchaseDate = Firebase.ServerValue.TIMESTAMP;
            
            itemsRef.child(item.$id + "/lastpurchase").transaction(function(lastpurchase) {
              return purchaseDate;
            });

            itemsRef.child(item.$id + "/stock").transaction(function(stock) {
              return stock+item.quantity;
            });

            transactions.push({list: 'Default', item: item.$id, date: purchaseDate, quantity: item.quantity});
            return !gotit;
          }
        }, function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        });
      },
      clearCart: function() {
        listRef.child('items').orderByChild('gotit').startAt(true).endAt(true).once('value', function(snap) {
          snap.forEach(function(snapData) {
            listRef.child('items/' + snapData.key()).remove();
          });
        });
      },
      removeFromCart: function(item) {
        var listItemRef = listRef.child("/items");

        listItemRef.child(item.$id + "/gotit").transaction(function(gotit){
          if (gotit !== null) {
            //Item in list.. need to tell them
            //Add a Transaction
            
            transactions.orderByChild("item").endAt(item.$id).limitToLast(2).once("value", function(snapShot) {
              var nIndex = 1;
              snapShot.forEach(function(itemSnap) {
                if (nIndex === 1) {
                  // Set the last purchase date = to the previous transaction
                  itemsRef.child(item.$id + "/lastpurchase").transaction(function(lastpurchase) {
                    return itemSnap.val().date;
                  });
                } else if(nIndex === 2) {
                  //delete the last transaction. When they uncheck in the cart, assuming Undo.
                  transactions.child(itemSnap.key()).remove();
                }
                nIndex++;
              });
            });
            
            itemsRef.child(item.$id + "/stock").transaction(function(stock) {
              return stock-item.quantity;
            });

            // transactions.push({list: $scope.list[0].$id, item: item.$id, date: purchaseDate});
            return !gotit;
          }
        }, function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        });
      },
      add: function(item) {
        var listItemRef = listRef.child("/items");
        //Check if item exists, if not create it.
        listItemRef.child(item.$id).transaction(function(currentData){
          if (currentData === null) {
              return { quantity: 1, category: item.category, gotit: false};
          } else {
            listItemRef.child(item.$id + "/quantity").transaction(function(quantity) {
              return quantity+1;
            });
          }
        }, function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        });
      },
      remove: function(item) {
        removeItem(item);
      },
      addQuantity: function(item, qty) {
        var listItemRef = listRef.child("/items");
        //Check if item exists, if not create it.

        listItemRef.child(item.$id + "/quantity").transaction(function(quantity) {
          return quantity+qty;
        }), function(error, committed, snapshot) {
          if (error) {
            console.log('Transaction failed abnormally!', error);
          }
        };
      },
      removeQuantity: function(item, qty) {
        var listItemRef = listRef.child("/items");
        //Check if item exists, if not create it.

        listItemRef.child(item.$id + "/quantity").transaction(function(quantity) {
          if (quantity <= 1) {
            removeItem(item);
          } else {
            return quantity-qty;
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