//localstorage.background.js
console.log('loaded localstorage.background.js');
var Cyphor = {}


function getStorage (request, sender, sendResponse) {
	sendResponse({data : localStorage[request.key]});
}

function updateLocalStorage (request, sender, sendResponse) {
	localStorage[request.key] = request.value;
	sendResponse({success : true});
}

function updateModel (keys, value) {
	var current = Cyphor;
	if(typeof(keys) == 'string'){
		Cyphor[keys] = value;
		return Cyphor[keys];
	}
	if(!Array.isArray(keys) || keys.length == 0){
		return current = value;
	}
	for(var i=0;i < keys.length-1; i++){
		if(current[keys[i]]){
			current = current[keys[i]];
		} else {
			current[keys[i]] = {};
			current = current[keys[i]];
		}
	}
	current[keys[i]] = value
	return current;
}

function getModel (keys) {
	var current = Cyphor;
	if(typeof(keys) == 'string'){
		return current[keys];
	}
	if(!Array.isArray(keys) || keys.length == 0){
		return current;
	}
	for(var i=0;i < keys.length-1; i++){
		if(current[keys[i]]){
			current = current[keys[i]];
		} else {
			return undefined;
		}
	}
	return current[keys[i]];
}

function postModel (keys, value, callback) {
	var messageObj = {
		method : 'updateModel',
		keys : keys,
		value : value
	};
	updateModel(keys, value);
	chrome.runtime.sendMessage(null, messageObj, null, callback || function () {});
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if(Array.isArray(tabs) && tabs.length > 0){
			chrome.tabs.sendMessage(tabs[0].id, messageObj, (callback || function () {}));
		}
	});
}

function fetchModel (keys, callback) {
	var messageObj = {
		method : 'getModel',
		keys : keys
	};
	chrome.runtime.sendMessage(null, messageObj, null, function (chrome_resp) {
		updateModel(keys, chrome_resp.response);
		if(callback){
			callback.apply(this, arguments)
		}
	});
}