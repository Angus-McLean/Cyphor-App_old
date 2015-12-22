(function() {

	angular.module('channels')
	.controller('channelsPageCtrl', ['$scope', '$http', '$rootScope', '$log', 'chromeMessage', 'CyphorModels', '$uibModal',
		function($scope, $http, $rootScope, $log, chromeMessage, CyphorModels, $uibModal) {

			$log.info('loaded channelsPageCtrl');

			//CyphorModels.fetchModel();

			//$scope.channels = $rootScope.Cyphor.channels;
			//$log.info('controller channels : ', $scope.channels);
			window.channelScope = $scope;
			// load channels for active tab
			chromeMessage.getActiveTab(function (chromeTabResp) {
				var active_url = chromeTabResp[0].url.match(/(https?|ftp):\/\/[A-z0-9_\-.]+/)
				var host;
				if(Array.isArray(active_url)){
					host = active_url[0].match(/[A-z0-9_\-.]+/);
				}
				

				$scope.activeHost = host;

			});

			$scope.grouppedChannels = {};

			$scope.groupChannels = function (channels) {
				
				if(Array.isArray(channels)){
					channels.forEach(function (chan) {
						if($scope.grouppedChannels[chan.origin_url]){
							$scope.grouppedChannels[chan.origin_url].push(chan);
						} else {
							$scope.grouppedChannels[chan.origin_url] = [chan];
						}
					});
				}
			}

			$scope.filterHostNames = function (hostNameObj) {
				$log.info('filterHostNames function : ', hostNameObj);
				return hostNameObj.length
			}

			$scope.saveNewChannel = function () {
				$log.info('triggered saveNewChannel');
				chromeMessage.messageActiveTab({action:'savechannel'}, function(resp){
					console.log(resp);
				});
			}

			$scope.open = function (channelObj) {
				console.log('opening channel ', channelObj);
				var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: '/public/modules/channels/views/channelConfig.client.view.html',
					controller: 'ModalInstanceController',
					size: 'lg',
					resolve: {
						channel: function() {
							return channelObj;
						}
					}
				});
			};

		}
	])
	// Controller used for the modal instance
	.controller('ModalInstanceController', function($scope, $uibModalInstance, channel) {

		$scope.title = "Channel Configuration";
		$scope.channel = channel;

		$scope.close = function() {
			$uibModalInstance.close();
		};

	});

})();