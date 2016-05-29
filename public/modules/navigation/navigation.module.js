
(function() {
	'use strict';

	// Use Applicaion configuration module to register a new module
	ApplicationConfiguration.registerModule('navigation', ['users', 'channels','ui.router']);

	angular.module('navigation')
	// angular.module(ApplicationConfiguration.applicationModuleName)
		.config(function ($stateProvider, $urlRouterProvider) {

			$stateProvider
				// .state('home', {
				// 	url: '/',
				// 	templateUrl: '/public/modules/core/views/home.view.html',
				// 	data: {
				// 		requiresAuth : false
				// 	}
				// })
				.state('signin', {
					url: '/signin',
					templateUrl: '/public/modules/users/views/signin.view.html',
					controller: 'signinCtrl',
					data: {
						requiresAuth : false
					}
				})
				.state('signup', {
					url: '/signup',
					templateUrl: '/public/modules/users/views/signup.view.html',
					controller: 'signupCtrl',
					data: {
						requiresAuth : false
					}
				})
				.state('channels',{
					url: '/channels',
					templateUrl: '/public/modules/channels/views/channels.view.html',
					controller: 'channelsCtrl',
					data: {
						requiresAuth : true
					}
				})
				// .state('channels.selected',{
				// 	url: '/channels/:id',
				// 	templateUrl: '/public/modules/channels/details.channels.partial.html',
				// 	data: {
				// 		requiresAuth : true
				// 	}
				// })
				.state('settings', {
					url: '/settings',
					templateUrl: '/public/modules/settings/views/settings.view.html',
					data: {
						requiresAuth : true
					}
				});
		})
		.run(function ($rootScope, AUTH_EVENTS, AuthService, $state) {
			// check if user is authenticated when state changes
			$rootScope.$on('$stateChangeStart', function (event, next) {
				console.log('$stateChangeStart to :', next);
				if (next.data.requiresAuth && !AuthService.isAuthenticated()) {
					event.preventDefault();

					// user is not logged in
					$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);

					// redirect user
					$state.go('signin');
				}
			});

			AuthService.loadUser().then(function () {
				$state.go('channels');
			}, function () {
				$state.go('signin');
			})

			// redirect user depending if they are sign in or not
			if(AuthService.isAuthenticated()){
				$state.go('channels');
			} else {
				$state.go('signin');
			}
		});

})();