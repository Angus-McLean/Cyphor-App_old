// input.background.js


function sendMouseEvents (tabId, coords) {
	chrome.debugger.attach({tabId:tabId}, '1.0');
	
	var mouseMove = {type : 'mouseMoved', x : coords.x,y : coords.y, timestamp : Date.now()};
	chrome.debugger.sendCommand({ tabId: tabId },'Input.dispatchMouseEvent',mouseMove);
	
	var mouseDown = {type : 'mousePressed', x : coords.x,y : coords.y, timestamp : Date.now(), button : 'left', clickCount : 1};
	chrome.debugger.sendCommand({ tabId: tabId },'Input.dispatchMouseEvent', mouseDown);

	var mouseUp = {type : 'mouseReleased', x : coords.x,y : coords.y, timestamp : Date.now(), button : 'left', clickCount : 1};
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

	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyDown', code: 'Enter', windowsVirtualKeyCode:13, nativeVirtualKeyCode : 13, macCharCode: 13  });			//@TESTING : turn on and off automatically pressing enter
	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', {
		type: 'char',
		//code: 'Enter',
		keyIdentifier: 'Enter',
		//keyIdentifier: 'U+000A',
		charCode:13,
		keyCode:13,
		which:13,
		windowsVirtualKeyCode:13,
		nativeVirtualKeyCode : 13,
		macCharCode: 13
	});
	chrome.debugger.sendCommand({ tabId: destTabId }, 'Input.dispatchKeyEvent', { type: 'keyUp', code: 'Enter', windowsVirtualKeyCode:13, nativeVirtualKeyCode : 13, macCharCode: 13  });

	chrome.debugger.detach({ tabId: destTabId });
}



Cyphor.background = {
	sendMouseEvents : sendMouseEvents,
	typeShort : typeShort,
	sendText : sendText
};