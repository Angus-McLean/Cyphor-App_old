// background onload
console.log('onload.background.js');

// load user
CyphorRouter.listen({
	url : '/users/me',
	method:  'GET'
}, {}, function () {});


// load all channels
CyphorRouter.listen({
	url : '/channels/me',
	method:  'GET'
}, {}, function () {});