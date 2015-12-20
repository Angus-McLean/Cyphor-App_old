(function() {

	angular.module('channels', ['channels.directive.channelGroup']).controller('channelsPageCtrl', ['$scope', '$http', '$rootScope', '$log', 'chromeMessage', 'CyphorModels',
		function($scope, $http, $rootScope, $log, chromeMessage, CyphorModels) {

			$log.info('loaded channelsPageCtrl');

			CyphorModels.fetchModel();

			$scope.channels = $rootScope.Cyphor.channels;
			$log.info('controller channels : ', $scope.channels);
			window.scope = $scope;
			// load channels for active tab
			chromeMessage.getActiveTab(function (chromeTabResp) {
				var active_url = chromeTabResp[0].url.match(/(https?|ftp):\/\/[A-z0-9_\-.]+/)
				var host = active_url[0].match(/[A-z0-9_\-.]+/);

				$scope.activeHost = host;

				// var messageObj = {
				// 	method: "loadChannels",
				// 	origin_url: active_url
				// };
				// chromeMessage.sendMessage(messageObj, function (chrome_response) {
				// 	$log.info('loaded channelsPageCtrl', chrome_response);
				// 	$scope.channels = chrome_response.response;
				// });
			});

			$scope.filterHostNames = function (hostNameObj) {
				$log.info('filterHostNames function : ', hostNameObj);
				return hostNameObj.length
			}

			$scope.saveNewChannel = function () {
				$log.info('triggered saveNewChannel');
				chromeMessage.messageActiveTab({method:'savechannel'}, function(resp){
					console.log(resp);
				});
			}

		}
	]);

})();