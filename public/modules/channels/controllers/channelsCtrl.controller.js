(function() {

	angular.module('channels')
	.controller('channelsCtrl', ['$scope', '$http', '$rootScope', '$log', 'ChromeMsg',//'chromeMessage', 'CyphorModels',
		function($scope, $http, $rootScope, $log, ChromeMsg) {

			$scope.grouppedChannels = {};

			var rawChannels = [{ "_id" : "56ad2f74cfd00b4afeec594d", "date_created" : "2016-01-30T21:27:58.334Z", "channel_paths" : [ "^\t^\t^\t^\t:scope > div\t:scope > div:nth-child(2)\t:scope > h4\t:scope > a\t:scope > span\t:scope > span" ], "message_count" : 0, "active" : true, "allowed_users" : [ ], "expiry_time" : null, "expiry_count" : null, "deleted" : false, "origin_url" : "www.facebook.com", "channel_name" : "Michael Pawly", "channel_id" : "14541904526573285", "user" : "56ad2e769fdddc44fe59de8d" }, { "_id" : "56ad52929fdddc44fe59de94", "date_created" : "2016-01-30T21:27:58.258Z", "channel_paths" : [ "^\t^\t^\t^\t:scope > div\t:scope > div:nth-child(2)\t:scope > h4\t:scope > a\t:scope > span\t:scope > span" ], "message_count" : 0, "active" : false, "allowed_users" : [ ], "expiry_time" : null, "expiry_count" : null, "deleted" : false, "origin_url" : "www.facebook.com", "channel_name" : "Angus McLean", "channel_id" : "14541994435089173", "user" : "56ad5228cfd00b4afeec5951" }, { "_id" : "56ad52d79fdddc44fe59de97", "date_created" : "2016-01-30T21:27:58.258Z", "channel_paths" : [ "^\t^\t^\t^\t^\t:scope > div:nth-child(2)\t:scope > div\t:scope > h2\t:scope > span:nth-child(2)" ], "message_count" : 0, "active" : false, "allowed_users" : [ ], "expiry_time" : null, "expiry_count" : null, "deleted" : false, "origin_url" : "cryptolayer.slack.com", "channel_name" : "@angus_mclean", "channel_id" : "14541995116253425", "user" : "56ad5228cfd00b4afeec5951" }]

			function groupChannels(channels) {
				
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

			$scope.groupChannels = groupChannels;

			$scope.filterHostNames = function (hostNameObj) {
				return hostNameObj.length
			}

			//@TODO : Off load this to a service (interact with active page)
			$scope.saveNewChannel = function () {
				ChromeMsg.messageActiveTab({action:'savechannel'}, function(resp){
					console.log(resp);
				});
			}

			$scope.showModal = false;
			$scope.selectedChannel;
			$scope.toggleModal = function(channelObj){
				$scope.showModal = !$scope.showModal;
				console.log('selected channel : ', channelObj);
				$scope.selectedChannel = channelObj;
			};


			groupChannels(rawChannels);

		}
	])

	.directive('modal', function () {
		return {
			template: '<div class="modal fade">' + '<div class="modal-dialog">' + '<div class="modal-body" ng-transclude></div>' + '</div>' + '</div>',
			restrict: 'E',
			transclude: true,
			replace:true,
			scope: true,
			controller: 'channelsConfig',
			link: function postLink(scope, element, attrs) {

				scope.$watch(attrs.visible, function(value){
					if(value == true)
						$(element).modal('show');
					else
						$(element).modal('hide');
				});

				$(element).on('shown.bs.modal', function(){
					scope.$apply(function(){
						scope.$parent[attrs.visible] = true;
					});
				});

				$(element).on('hidden.bs.modal', function(){
					scope.$apply(function(){
						scope.$parent[attrs.visible] = false;
					});
				});
			}
		};
	});

})();