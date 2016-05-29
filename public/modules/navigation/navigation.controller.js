// core.controller.js

(function() {
	'use strict';

	angular.module('navigation')
	// angular.module(ApplicationConfiguration.applicationModuleName)
		.controller('coreCtrl', ['$scope', 'AuthService', '$state', '$log', function($scope, AuthService, $state, $log) {

			$scope.signout = function(){
				AuthService.signout().then(
					function signoutSuccess(res) {
						$state.go('signin')
					},
					function signoutError (res) {
						$log.error('failed-signout', res)
					});
			}			

		}]);

})();