//crudchannels.content.js
console.log('loaded crudchannels.content.js')



function saveChannelObj(channel_path, channel_name){
	var channel_id = Date.now() + Math.random().toString().substring(2,6);
	var channelObj = {
		origin_url : window.location.host,
		channel_paths : [channel_path],
		channel_name : channel_name,
		channel_id : channel_id,
		active : true,
	};

	var requestObj = {
		action : 'binder',
		method : 'PUT',
		url : '/binder/channels',
		data : channelObj
	};

	chrome.runtime.sendMessage(requestObj, function(response) {
		console.log('PUT /binder/channels finished got following response : ', response);

		var chanRespObj = response.data
		if(!chanRespObj){
			try{
				chanRespObj = JSON.parse(response.response);
			} catch (e) {
				console.warn('Couln\'t parse our the channel from server response. Response : ', response);
			}
		}
		CyphorDB.push(chanRespObj._id, chanRespObj);
	});

	return channel_id;
}


function loadChannels () {
	var origin_url = window.location.host;

	var queryObj = {origin_url : origin_url};

	var requestObj = {
		action : 'binder',
		method : 'POST',
		url : '/binder/channels',
		body : JSON.stringify(queryObj),
		data : queryObj
	};

	chrome.runtime.sendMessage(requestObj, function (chrome_response) {
		if(chrome_response && chrome_response.status == 200 && (chrome_response.data || chrome_response.body)){
			channelsArr = chrome_response.data || chrome_response.body;
			if(Array.isArray(channelsArr)){
				channelsArr.forEach(function (elem) {
					CyphorDB.push(elem._id, elem);
				})
			}
		}
	});
}




/*
	Uses old model of dedicated saveChannel and loadChannel Routes
*/
// function saveChannelObj(channel_path, channel_name){
// 	var channel_id = Date.now() + Math.random().toString().substring(2,6);
// 	var channelObj = {
// 		origin_url : window.location.host,
// 		channel_path : channel_path,
// 		channel_name : channel_name,
// 		channel_id : channel_id
// 	};

// 	chrome.runtime.sendMessage({action: "saveChannel", channelObj: channelObj}, function(response) {
// 		console.log(response);
// 	});

// 	return channel_id;
// }



/*
// Uses old channel format //

function loadChannels(){

	var origin_url = window.location.host;

	chrome.runtime.sendMessage(null, {action: "loadChannels", origin_url: origin_url}, null, function(chrome_response) {
		console.log('loadChannels callback');
		console.log(chrome_response);
		if(chrome_response && chrome_response.success && chrome_response.response !== ''){



			var resp_obj = JSON.parse(chrome_response.response);
			var channels_arr = resp_obj.channelObj;
			raw_channels = channels_arr;
			var channels_obj = {}
			for(var i=0;i<channels_arr.length;i++){
				var tempPath
				for (var k = 0; k < channels_arr[i].channel_paths.length; k++) {
					tempPath = channels_arr[i].channel_paths[k];
					if(channels_obj[tempPath]){
						channels_obj[tempPath].push(channels_arr[i].channel_name)
					} else {
						channels_obj[tempPath] = [channels_arr[i].channel_name]
					}
				};
			}
			channels = channels_obj;
		}
	});
}
function verifyIfSavedChannel (start_node) {
	if(channels !== undefined){
		for(var i in channels){
			var title_elem = traversePath(start_node, i.split('\t'), CryptoLayer.settings.fuzzyTravers);
			var test_title = title_elem.innerText;
			for(var j in channels[i]){
				if(channels[i][j].indexOf(test_title) >= 0 || test_title.indexOf(channels[i][j]) >= 0){
					return true;
				}
			} 
			return false;
		}
		return false;
	} else {
		return false;
	}
}
*/








// function loadChannels () {
// 	var origin_url = window.location.host;

// 	chrome.runtime.sendMessage({action: "loadChannels", origin_url: origin_url}, function(chrome_response) {
// 		console.log('loadChannels callback');
// 		console.log(chrome_response);
// 		if(chrome_response && chrome_response.success){

// 			var channels_arr = chrome_response.response;
// 			if(Array.isArray(channels_arr) && channels_arr.length){
// 				var modelKeys = ['channels', origin_url];
// 				postModel (modelKeys, channels_arr, function () {
// 					console.info('loadChannels postModel Response', arguments);
// 				});
// 			}
// 		}
// 	});
// }


// newer approach using jsDataStore library
function verifyIfSavedChannel (start_node) {
	var channels = [];

	channels = CyphorDB.query({origin_url : window.location.host});

	for(var i in channels){
		if(channels[i].active == false){
			continue;
		}
		var channel_path_arr = channels[i].channel_paths[0].split('\t');
		var title_elem = traversePath(start_node, channel_path_arr, CryptoLayer.settings.fuzzyTravers);
		var test_title = '';
		if(title_elem != null){
			test_title = title_elem.innerText;
		}		
		if(channels[i].channel_name.indexOf(test_title) >= 0 || test_title.indexOf(channels[i].channel_name) >= 0){
			return channels[i];
		}
	}
	return false;
}



/*
	Uses old approach for passing data.. Cyphor.channels[window.location.host] etc
*/
// function verifyIfSavedChannel (start_node) {
// 	var channels = {}
// 	if(Cyphor.channels && Cyphor.channels[window.location.host] && Array.isArray(Cyphor.channels[window.location.host])){
// 		channels = Cyphor.channels[window.location.host];
// 	}
// 	for(var i in channels){
// 		if(channels[i].active == false){
// 			continue;
// 		}
// 		var channel_path_arr = channels[i].channel_paths[0].split('\t');
// 		var title_elem = traversePath(start_node, channel_path_arr, CryptoLayer.settings.fuzzyTravers);
// 		var test_title = '';
// 		if(title_elem != null){
// 			test_title = title_elem.innerText;
// 		}		
// 		if(channels[i].channel_name.indexOf(test_title) >= 0 || test_title.indexOf(channels[i].channel_name) >= 0){
// 			return channels[i];
// 		}
// 	}
// 	return false;
// }