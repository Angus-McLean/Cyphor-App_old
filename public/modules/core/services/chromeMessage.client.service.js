(function () {
	
	var chromeMessage = function  ($http) {
		
		function sendMessage (messageObj, callback) {
			chrome.runtime.sendMessage(null, messageObj, null, callback);
		}

		function broadcast (messageObj, callback) {
			chrome.runtime.sendMessage(null, messageObj, null, callback);
			chrome.tabs.query({}, function(tabs) {
				if(Array.isArray(tabs) && tabs.length > 0){
					chrome.tabs.sendMessage(tabs[0].id, inner_msg, callback);
				}
			});
		}

		function getActiveTab (callback) {
			chrome.tabs.query({active: true, currentWindow: true}, callback);
		}

		function messageActiveTab (messageObj, callback) {
			var inner_msg = messageObj;
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				if(Array.isArray(tabs) && tabs.length > 0){
					chrome.tabs.sendMessage(tabs[0].id, inner_msg, callback);
				}
			});
		}

		return {
			sendMessage : sendMessage,
			broadcast : broadcast,
			getActiveTab : getActiveTab,
			messageActiveTab : messageActiveTab
		};
	};

	var module =  angular.module(ApplicationConfiguration.applicationModuleName);
	module.factory('chromeMessage', chromeMessage);
})();