

(function () {

	// var module =  angular.module(ApplicationConfiguration.applicationModuleName);
	var module = angular.module('users');
	module.service('Session', function () {
		this.create = function (sessionId, username, userRole) {
			this.id = sessionId;
			this.username = username;
			this.userRole = userRole;
		};
		this.destroy = function () {
			this.id = null;
			this.username = null;
			this.userRole = null;
		};
	});

})();