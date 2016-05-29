// core.constants.js

(function() {
	'use strict';

	angular.module('navigation')
	// angular.module(ApplicationConfiguration.applicationModuleName)
		.constant('AUTH_EVENTS', {
			loginSuccess: 'auth-login-success',
			loginFailed: 'auth-login-failed',
			logoutSuccess: 'auth-logout-success',
			sessionTimeout: 'auth-session-timeout',
			notAuthenticated: 'auth-not-authenticated',
			notAuthorized: 'auth-not-authorized'
		});
})();