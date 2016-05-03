
var Cyphor = {};

console.log('loaded background');
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(arguments);
	
	if(request.action == 'MESSAGE'){
		Cyphor.background.sendMouseEvents(sender.tab.id, request.coords);
		setTimeout(function () {
			Cyphor.background.sendText(sender.tab.id, request.message);
			sendResponse({success : true, response : 'received'});
		},1000)
		
	} else if(request.action == 'SUBMIT_BUTTON'){
		Cyphor.background.sendMouseEvents(sender.tab.id, request.inputCoords);
		Cyphor.background.sendText(sender.tab.id, request.inputText);
		Cyphor.background.sendMouseEvents(sender.tab.id, request.buttonCoords);
	}
	
	//sendResponse({success : true, response : 'received'});

	return true;
});

chrome.browserAction.onClicked.addListener(function (tab) {
	console.log('clicked browser action', arguments);
	chrome.tabs.sendMessage(tab.id, {action: 'BROWSER_ACTION'});
})

chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);

	if(command == 'quickcrypt'){
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			if(tabs && tabs.length){
				chrome.tabs.sendMessage(tabs[0].id, {action: 'quickcrypt'});
			}
		});
	}
});