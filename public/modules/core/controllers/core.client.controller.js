(function () {
	var cyphor = angular.module('core')
		.controller('MainCtrl', ["$scope", '$log', '$http', '$rootScope', 'CyphorModels', function ($scope, $log, $http, $rootScope, CyphorModels){

		// Initialize $rootScope.Cyphor
		$scope.CyphorModels = CyphorModels;


		//////// Handle Tabs ////////
		// default to profile
		$scope.activeTab = 'profile';

		$scope.selectTab = function (tabName) {
			$log.info('switched tab to : '+tabName);
			$scope.activeTab = tabName;
		}

		//////// Load User Data ////////
		$http.get(ApplicationConfiguration.appConfig.url + '/users/me').then(function (response) {
			$rootScope.user = response.data;
			// $rootScope.user = {
			// 	avatar : '/public/modules/users/img/incognito_small.jpg',
			// 	firstname : 'Angus',
			// 	lastname : 'McLean',
			// 	username : 'amclean'
			// };
			$log.info('loaded user : '+JSON.stringify(response.data));
		});
	}]);
	console.log('registered MainCtrl to core')
})();