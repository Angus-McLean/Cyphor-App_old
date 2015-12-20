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
		action : 'updateModel',
		keys : keys,
		value : value
	};
	updateModel(keys, value);
	chrome.runtime.sendMessage(messageObj, callback || function () {});
}

function fetchModel (keys, callback) {
	var messageObj = {
		action : 'getModel',
		keys : keys
	};
	chrome.runtime.sendMessage(messageObj, function (chrome_resp) {
		updateModel(keys, chrome_resp.response)
		callback.apply(this, arguments)
	});
}