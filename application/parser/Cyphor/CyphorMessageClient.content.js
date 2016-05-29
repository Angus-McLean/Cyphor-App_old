// CyphorMessageClient.js

(function (wind) {

	function transportLayerUp(msg) {
		chrome.runtime.sendMessage(msg, function (resp) {});
	}

	wind.CyphorMessageClient = new MessageClient({
		up : transportLayerUp
	});

})(window);
