
(function(moduleAndDeps) {

	var module =  angular.module(ApplicationConfiguration.applicationModuleName);



	function parseValues (scope, str) {

		var url = str.match(/[A-z0-9_\-\/\.\:]+/);
		//console.log('parsed url : ', url);
		url = (url)?url[0]:url;
		var postParams = str.match(/: *(\{.+\}) *(\||$)?/);
		//console.log('parsed postParams : ', postParams);
		postParams = (postParams)?postParams[1]:postParams;
		var pipeTo = str.match(/\| *([A-z0-9_\-]+) *$/);
		//console.log('parsed pipeTo : ', pipeTo);
		pipeTo = (pipeTo)?pipeTo[1]:pipeTo;
		
		var params = {
			url : url,
			body : postParams,
			pipeTo : pipeTo
		}

		return params;
	}

	function sendBindDown ($http, $gtp, scope, url, postParams, pipeTo) {
		console.log('sendBindDown', arguments);
		if(!url){
			console.log('Couldn\'t parse url from parameters');
		}
		if(postParams){
			$gtp.post(url, postParams)
				.then(function (resp) {
					console.log('bindDown Callback', resp);
					if(typeof scope[pipeTo] === 'function'){
						scope[pipeTo](resp.data);
					} else if(pipeTo !== null){
						scope[pipeTo] = resp.data;
					}
				}, function (resp) {
					console.warn(resp);
				});
		} else {
			$gtp.get(url)
				.then(function (resp) {
					console.log('bindDown Callback', resp);
					if(typeof scope[pipeTo] === 'function'){
						scope[pipeTo](resp.data);
					} else if(pipeTo !== null){
						scope[pipeTo] = resp.data;
					}
				}, function (resp) {
					console.warn(resp);
				});
		}
		
	}

	function sendBindUp ($http, $gtp, scope, url, postParams, pipeTo) {
		if(!postParams){
			return;
		}
		console.log('sendBindUp', arguments);
		if(!url){
			console.log('Couldn\'t parse url from parameters');
			return;
		}

		$gtp.put(url, postParams)
			.then(function (resp) {
				console.log('bindUp Callback', resp);
				if(typeof scope[pipeTo] === 'function'){
					scope[pipeTo](resp.data);
				} else {
					scope[pipeTo] = resp.data;
				}
			}, function (resp) {
				console.warn(resp);
			});
	}


	module.directive('bindDown', ['$http','$gtp','$log', function ($http, $gtp, $log) {

			function link (scope, element, attrs, controller, transcludeFn) {
				attrs.$observe('bindDown', function (newVal, oldVal) {
					
					var parsedParams = parseValues(scope, newVal);
					sendBindDown($http, $gtp, scope, parsedParams.url, parsedParams.body, parsedParams.pipeTo)
					
				});

			}

			return {
				link : link
			};
		}])
	module
		.directive('bindUp', ['$http','$gtp','$log', function ($http, $gtp, $log) {

			function link (scope, element, attrs, controller, transcludeFn) {
				attrs.$observe('bindUp', function (bindVal, oldVal) {

					var parsedParams = parseValues(scope, bindVal);
					sendBindUp($http, $gtp, scope, parsedParams.url, parsedParams.body, parsedParams.pipeTo)

				});

			}

			return {
				link : link
			};
		}])
})();

