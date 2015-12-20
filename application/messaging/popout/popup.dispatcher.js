// popup.dispatcher.js
console.log('loaded popup.dispatcher.js');

function passMessageToActiveTab (messageObj, callback_func) {
    var inner_msg = messageObj;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if(Array.isArray(tabs) && tabs.length > 0){
        	chrome.tabs.sendMessage(tabs[0].id, inner_msg, callback_func);
        }
    });
}

