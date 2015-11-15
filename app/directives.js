angular.module('myApp.directives', [])

	.directive('bounceError', ['$animate', function($animate) {
	  return {
	    link: function(scope, element, attrs) {
	      var el = element[0];

	      scope.$watch(attrs.bounceError, function(value) {
	        if (value === true) {
	          $animate.addClass(el, 'bounce').then(function() {
	            $animate.removeClass(el, 'bounce');
	          }); 
	        }
	      });

	    }
	  };
	}])

;