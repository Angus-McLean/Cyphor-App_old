// content.dispatcher.js
console.log('loaded content.dispatcher.js');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('request.method : '+request.method);
	if(request.method == 'savechannel'){
		triggerChannelSelection();
		sendResponse({result : true})
	} else if(request.method == 'viewchannels') {
		sendResponse({result : channels});
	} else if(request.method == 'updateModel'){
		
		sendResponse({result : updateModel(request.keys, request.value)})
	} else if(request.method == 'getModel'){
		sendResponse({result : getModel(request.keys)})
	} 
});