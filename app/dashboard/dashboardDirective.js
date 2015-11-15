 angular.module('myApp.directives.dashboardDirective', [])

  .directive('draggable', [function() {
    return function(scope, element) {
      // this gives us the native JS object
      var el = element[0];
      
      el.draggable = true;
      
      el.addEventListener(
        'dragstart',
        function(e) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('Text', this.id);
          this.classList.add('drag');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'dragend',
        function(e) {
          this.classList.remove('drag');
          return false;
        },
        false
      );
    }
  }])

  .directive('droppable', ['getDBUrl', 'user', function(getDBUrl, user) {
    return {
      scope: {
        drop: '&',
        bin: '='
      },
      link: function(scope, element) {
        // again we need the native object
        var el = element[0];
        
        el.addEventListener(
          'dragover',
          function(e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');
            return false;
          },
          false
        );
        
        el.addEventListener(
          'dragenter',
          function(e) {
            this.classList.add('over');
            return false;
          },
          false
        );
        
        el.addEventListener(
          'dragleave',
          function(e) {
            this.classList.remove('over');
            return false;
          },
          false
        );
        
        el.addEventListener(
          'drop',
          function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();
            
            var binId = this.id;
            var item = document.getElementById(e.dataTransfer.getData('Text'));
            var list = document.getElementById("List" + binId);

            var baseRef = new Firebase(getDBUrl.path + '/' + user.get().uid);

            var categoryRef = baseRef.child('categories')
            var itemsRef = baseRef.child('/items/' + item.id);
            var listRef = baseRef.child('/lists/' + 'Default/' + "items/" + item.id);

            var previousCat = null;
            //console.log(itemsRef.child("category"));
            
            itemsRef.once('value', function(data){
              //data.forEach(function(snap){
                //console.log(data.val().category);
                previousCat = data.val().category;
              //});
            });
            itemsRef.child('category').remove();

            // console.log("Remove Child: " + categoryRef.child(previousCat + "/items/" + item.id));
            categoryRef.child(previousCat + "/items/" + item.id).set(null);
            // console.log("Adding Child: " + categoryRef.child(binId + "/items/" + item.id));
            categoryRef.child(binId + "/items/" + item.id).set(true);

            //Add Category to List Item
            listRef.child("category").remove();
            listRef.child("category").set(binId);
            
            //console.log("old cat: " + itemsRef.child('category'));
            //Removes old category from item and adds new one
            itemsRef.child("category").remove();
            //itemsRef.child("category/" + binId).set(true);
            itemsRef.child("category").set(binId);
          
            this.classList.remove('over');
                      
            // console.log("Bin: " + binId);
            
            // console.log("item: " + item.id);
            
            return false;
          },
          false
        );
      }
    }
  }])
;