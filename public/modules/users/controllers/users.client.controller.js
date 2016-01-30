(function() {

	angular.module('users').controller('authenticationCtrl', ['$scope', '$http', '$rootScope', '$log',
		function($scope, $http, $rootScope, $log) {

			$log.info('Loaded authenticationCtrl');
			$scope.signinform = true;
			$scope.signupform = false;
			$scope.formid = 'signinform';
			
			function formEncode (obj) {
				var str = [];
				for(var p in obj)
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			}

			function sendFormData (urlEndPoint, formString) {
				$log.info('executing signin : '+formString);

				$http({
					method: 'POST',
					url: urlEndPoint,
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: formString
				}).success(function(response) {
					// If successful we assign the response to the global user model
					$rootScope.user = response;
					$log.info('signed in : ' + response);

				}).error(function(response) {
					$scope.error = response.message;
					$log.error(response);
				});
			}

			$scope.signinFunction = function() {

				var credentials = {
					username : $('#username').val(),
					password : $('#password').val()
				};

				var credentials_str = formEncode(credentials);
				sendFormData(ApplicationConfiguration.appConfig.url + '/auth/signin', credentials_str);

			};


			$scope.signupFunction = function () {
				var credentials = {
					firstName : $('[name=firstName]').val(),
					lastName : $('[name=lastName]').val(),
					email : $('[name=email]').val(),
					username : $('[name=username]').val(),
					password : $('[name=password]').val()
				};

				var credentials_str = formEncode(credentials);
				sendFormData(ApplicationConfiguration.appConfig.url + '/auth/signup', credentials_str);
			}

			$scope.signoutFunction = function () {
				$log.info('executing signout');
				$http({method: 'GET', url : ApplicationConfiguration.appConfig.url + '/auth/signout'})
					.then(function (resp) {
						console.log(resp)
					}, function (resp) {
						console.log(resp)
					});
				$rootScope.user = null;
				$scope.user = null;
			}
		}
	]);
})();