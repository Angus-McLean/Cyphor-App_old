(function () {
	var cryptolayer = angular.module('cryptolayer', []);

	cryptolayer.controller('MainCtrl', ["$scope", '$log', '$http', '$rootScope', 'CyphorModels', function ($scope, $log, $http, $rootScope, CyphorModels){

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
		$http.get('http://www.cryptolayer.io/users/me').then(function (response) {
			$rootScope.user = response.data;
			// $rootScope.user = {
			// 	avatar : '/public/modules/users/img/incognito_small.jpg',
			// 	firstname : 'Angus',
			// 	lastname : 'McLean',
			// 	username : 'amclean'
			// };
			$log.info('loaded user : '+JSON.stringify(response.data));
		});
	}])
})();