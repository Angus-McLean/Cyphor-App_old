(function () {
	
	function buildGtp () {
		
		var requestObj = function (reqObjInitializationParams) {
			var onSuccess;
			var onError;

			// - execute code for asynchornous call.
			// - callback Functions to execute onSuccess -or- onError
			// - callback funciton is passed the response body JSON object
			reqObjInitializationParams.action = 'binder';


			chrome.runtime.sendMessage(reqObjInitializationParams, function (resp) {
				if(resp.success == true || resp.status == 200){
					onSuccess(resp);
				} else {
					onError(resp);
				}
				
			});

			// end of custom code segment //

			this.then = function (onSuccess_provided, onError_provided) {
				onSuccess = onSuccess_provided;
				onError = onError_provided;
			}
		};


		// Google Chrome Transfer Protocol
		function $gtp (requestParams) {
			return new requestObj(requestParams);
		}

		$gtp.getActiveTab = function getActiveTab (callback) {
			chrome.tabs.query({active: true, currentWindow: true}, callback);
		};

		$gtp.post = function (url, body) {
			return new requestObj({
				url : url,
				method : 'POST',
				data : body
			});
		}

		$gtp.put = function (url, body) {
			return new requestObj({
				url : url,
				method : 'PUT',
				data : body
			});
		}

		$gtp.get = function (url) {
			return new requestObj({
				url : url,
				method : 'GET'
			});
		}
		//return $gtp;

		return $gtp;
	}
	var module =  angular.module(ApplicationConfiguration.applicationModuleName);
	//module.factory('gtp', buildGtp)
	module.service('$gtp', buildGtp)
})();

