//background.dispatcher.js
//console.log('loaded background.dispatcher.js');


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('background.dispatcher.js - request.action : '+request.action, request);
	if (request.action == "getStorage"){
		//call to localstorage.background.js
		getStorage(request, sender, sendResponse)
	} else if(request.action == "updateLocalStorage"){
		//call to localstorage.background.js
		updateLocalStorage(request, sender, sendResponse)
	} else if(request.action == 'saveMessageObj') {
		//call to messages.background.js
		saveMessageObj(request, sender, sendResponse);
	} else if(request.action == 'saveChannel') {
		//call to channels.background.js
		saveChannelObj(request, sender, sendResponse);
	} else if(request.action == 'loadChannels') {
		//call to channels.background.js
		loadChannelObj(request, sender, sendResponse);
	} else if(request.action == 'updateModel') {
		//call to channels.background.js
		sendResponse({result : updateModel(request.keys, request.value)});
	} else if(request.action == 'getModel') {
		//call to channels.background.js
		sendResponse({response : getModel(request.keys)});	
	} else if(request.action == 'binder') {
		//call to channels.background.js
		CyphorRouter.listen(request, sender, sendResponse);
	} else {
		sendResponse({success : false, response : 'Invalid action'});
	}
	return true;
});