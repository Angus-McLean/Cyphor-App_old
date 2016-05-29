(function() {

	angular.module('channels')
	.controller('channelsConfig', function($scope) {

		// $scope.channel = channel;

		// // dictate to show or hide channel expiry parameters
		// $scope.enable_exp_time = !!channel.expiry_time;
		// $scope.expDays = 0;
		// $scope.expHours = 0;
		// if(!isNaN(channel.expiry_time)){
		// 	$scope.expDays = parseInt(channel.expiry_time/(1000*60*60*24));
		// 	// hours = (expiry time - number of days) / (seconds in an hour)
		// 	$scope.expHours = parseInt((channel.expiry_time - $scope.expDays*(1000*60*60*24))/(1000*60*60));
		// }

		// $scope.enable_exp_count = !!channel.expiry_count;

	});
})();