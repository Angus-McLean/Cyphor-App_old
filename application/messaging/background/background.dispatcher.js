//background.dispatcher.js
console.log('loaded background.dispatcher.js');


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('background.dispatcher.js - request.method : '+request.method);
	if (request.method == "getStorage"){
		//call to localstorage.background.js
		getStorage(request, sender, sendResponse)
	} else if(request.method == "updateLocalStorage"){
		//call to localstorage.background.js
		updateLocalStorage(request, sender, sendResponse)
	} else if(request.method == 'saveMessageObj') {
		//call to messages.background.js
		saveMessageObj(request, sender, sendResponse);
	} else if(request.method == 'saveChannel') {
		//call to channels.background.js
		saveChannelObj(request, sender, sendResponse);
	} else if(request.method == 'loadChannels') {
		//call to channels.background.js
		loadChannelObj(request, sender, sendResponse);
	} else if(request.method == 'updateModel') {
		//call to channels.background.js
		sendResponse({result : updateModel(request.keys, request.value)});

	} else if(request.method == 'getModel') {
		//call to channels.background.js
		sendResponse({response : getModel(request.keys)});
		
	} else {
		sendResponse({success : false, response : 'Invalid method'});
	}
	return true;
});