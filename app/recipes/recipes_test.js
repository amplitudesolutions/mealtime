'use strict';

describe('myApp.recipes module', function() {

  beforeEach(module('myApp.recipes'));

  describe('recipes controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var view2Ctrl = $controller('RecipesCtrl');
      expect(RecipesCtrl).toBeDefined();
    }));

  });
});