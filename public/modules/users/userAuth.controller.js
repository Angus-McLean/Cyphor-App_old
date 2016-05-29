// userAuth.controller.js

(function() {
	'use strict';

	angular.module('users')
		
		.controller('signupCtrl', ['$scope', 'AuthService', '$state', '$log', function($scope, AuthService, $state, $log) {
			
			$log.debug('load','signupCtrl');

			// send sign up form
			//@TODO : go to website for sign up
			$scope.signupFunction = function(){
				
				var formStr = $('form[name="signup"]').serialize();
				$log.log('signup-serialize', formStr);

				AuthService.signup(formStr);
			}

		}])
		.controller('signinCtrl', ['$scope', 'AuthService', '$state', '$log', function($scope, AuthService, $state, $log) {
			// send sign up form
			$log.debug('load','signinCtrl');

			$scope.signinFunction = function(){
				$log.debug('triggered signinFunction');
				var formStr = $('form[name="signin"]').serialize();
				$log.log('signin-serialize', formStr);

				AuthService.signin(formStr).then(
					function (res) {
						$log.debug('change-state', 'channels');
						$state.go('channels');
					},
					function (res) {
						//@TODO : notify user that signin failed
						$log.error('signin:fail',res);
					});
			};
		}]);

})();