(function () {

	var channelGroup = function () {
		return {
			restrict : 'A',
			scope : {
				channelGroup: '=',
				hostname: '=',
			},
			templateUrl : '/public/modules/channels/views/channelGroup.client.view.html',
			controller : function ($scope, $log, CyphorModels) {

				$scope.isCollapsed = true;

				$scope.toggleChannel = function(channelObj){
					$log.info('toggled channel : ',channelObj);
					channelObj.active = !channelObj.active;
					//CyphorModels.syncPost(['channels', channelObj.origin_url]);
				}
			}
		};
	};

	angular.module('channels').directive('channelGroup', channelGroup);
})();
