// content.dispatcher.js
console.log('loaded content.dispatcher.js');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('request.action : '+request.action);
	if(request.action == 'savechannel'){
		triggerChannelSelection();
		sendResponse({result : true})
	} else if(request.action == 'viewchannels') {
		sendResponse({result : channels});
	} else if(request.action == 'updateModel'){
		
		sendResponse({result : updateModel(request.keys, request.value)})
	} else if(request.action == 'getModel'){
		sendResponse({result : getModel(request.keys)})
	} else if(request.action == 'binder') {
		//call to channels.background.js
		CyphorRouter.listen(request, sender, sendResponse);
	} else {
		sendResponse({success : false, response : 'Invalid action'});
	}
	return true;
});