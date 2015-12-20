(function () {

	var CyphorModels = function  ($rootScope, chromeMessage) {
		
		$rootScope.Cyphor = $rootScope.Cyphor || {};

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			console.log('request.action : '+request.action);
			if(request.action == 'updateModel' && request.value){
				sendResponse({result : updateModel(request.keys, request.value)})
			} else if(request.action == 'getModel'){
				sendResponse({result : getModel(request.keys)})
			} 
		});

		
		function updateModel (keys, value) {
			var current = $rootScope.Cyphor;
			if(typeof(keys) == 'string'){
				$rootScope.Cyphor[keys] = value;
				return $rootScope.Cyphor[keys];
			}
			if(!Array.isArray(keys) || keys.length == 0){
				$rootScope.Cyphor = value;
				return $rootScope.Cyphor;
			}
			for(var i=0;i < keys.length-1; i++){
				if(current[keys[i]]){
					current = current[keys[i]];
				} else {
					current[keys[i]] = {};
					current = current[keys[i]];
				}
			}
			current[keys[i]] = value
			return current;
		}

		function getModel (keys) {
			var current = $rootScope.Cyphor;
			if(typeof(keys) == 'string'){
				return current[keys];
			}
			if(!Array.isArray(keys) || keys.length == 0){
				return current;
			}
			for(var i=0;i < keys.length-1; i++){
				if(current[keys[i]]){
					current = current[keys[i]];
				} else {
					return undefined;
				}
			}
			return current[keys[i]];
		}

		function postModel (keys, value, callback) {
			var messageObj = {
				action : 'updateModel',
				keys : keys,
				value : value
			};
			updateModel(keys, value);
			chromeMessage.sendMessage(messageObj, callback || function () {});
			chromeMessage.messageActiveTab(messageObj, callback || function () {});
		}

		function fetchModel (keys, callback) {
			var messageObj = {
				action : 'getModel',
				keys : keys
			};
			chromeMessage.sendMessage(messageObj, function (chrome_resp) {
				updateModel(keys, chrome_resp.response)
				if(callback){
					callback.apply(this, arguments)
				}
			});
		}

		function syncPost (keys, callback) {
			var value = getModel(keys);
			var messageObj = {
				action : 'updateModel',
				keys : keys,
				value : value
			};
			updateModel(keys, value);
			chromeMessage.sendMessage(messageObj, callback || function () {});
			chromeMessage.messageActiveTab(messageObj, callback || function () {});
		}


		return {
			updateModel : updateModel,
			getModel : getModel,
			postModel : postModel,
			fetchModel : fetchModel,
			syncPost : syncPost
		};
	};

	var module =  angular.module(ApplicationConfiguration.applicationModuleName);
	module.factory('CyphorModels', CyphorModels);
})();