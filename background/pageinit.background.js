
console.log('loaded background');
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(arguments);
	
	if(request.action == 'MESSAGE'){
		sendMouseEvents(sender.tab.id, request.coords);
		sendText(sender.tab.id, request.message);
	}
	// setTimeout(function () {
	// 	sendResponse({success : true, response : 'received'});
	// }, 1000);
	
	sendResponse({success : true, response : 'received'});

	return true;
});

chrome.browserAction.onClicked.addListener(function (tab) {
	console.log('clicked browser action', arguments);
	chrome.tabs.sendMessage(tab.id, {action: 'BROWSER_ACTION'});
})

function sendMouseEvents (tabId, coords) {
	chrome.debugger.attach({tabId:tabId}, '1.0');
	
	var mouseMove = {type : 'mouseMoved', x : coords.x,y : coords.y, timestamp : Date.now()};
	chrome.debugger.sendCommand({ tabId: tabId },'Input.dispatchMouseEvent',mouseMove);
	
	var mouseDown = {type : 'mousePressed', x : coords.x,y : coords.y, timestamp : Date.now(), button : 0, clickCount : 1};
	chrome.debugger.sendCommand({ tabId: tabId },'Input.dispatchMouseEvent', mouseDown);

	var mouseUp = {type : 'mouseReleased', x : coords.x,y : coords.y, timestamp : Date.now(), button : 0, clickCount : 1};
	chrome.debugger.sendCommand({ tabId: tabId },'Input.dispatchMouseEvent', mouseUp);

	chrome.debugger.detach({ tabId: tabId });
}

function typeShort (destTabId, text) {
	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyDown', text : text});
	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyUp', text : text});
}

function sendText (destTabId, textStr) {
	console.log('typing ', textStr);
	var chunkSize = 4;
	chrome.debugger.attach({ tabId: destTabId }, "1.0");

	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyDown', text : '-'});
	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyUp', text : '-'});
	for(var i=0;i<textStr.length;i+=chunkSize){
		typeShort(destTabId, textStr.slice(i,i+chunkSize));
	}

	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyDown', windowsVirtualKeyCode:13, nativeVirtualKeyCode : 13, macCharCode: 13  });
	//chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode:13, nativeVirtualKeyCode : 13, macCharCode: 13  });

	chrome.debugger.detach({ tabId: destTabId });
}