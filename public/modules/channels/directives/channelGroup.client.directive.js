(function () {

	var channelGroup = function () {
		return {
			restrict : 'A',
			scope : {
				channelGroup: '=',
				hostname: '=',
			},
			templateUrl : '/public/modules/channels/views/channelGroup.client.view.html',
			controller : ['$scope', '$log', 'CyphorModels', '$uibModal', function ($scope, $log, CyphorModels, $uibModal) {
				console.log('executing channel group controller');
				$scope.isCollapsed = true;

				$scope.open = function (channelObj) {
					console.log('opening channel ', channelObj);
					var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: '/public/modules/channels/views/channelConfig.client.view.html',
						//windowTemplateUrl: '/public/modules/channels/views/channelConfig.client.view.html',
						controller: 'ModalInstanceController',
						size: 'sm',
						resolve: {
							channel: function() {
								return channelObj;
							}
						}
					});
				};
			}]
		};
	};

	angular.module('channels').directive('channelGroup', channelGroup);





})();
