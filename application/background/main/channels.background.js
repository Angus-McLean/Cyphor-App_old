//channels.background.js
//console.log('loaded channels.background.js');

function saveChannelObj (request, sender, sendResponse) {

	if(request.channelObj){

		var x = new XMLHttpRequest();
		x.open('POST','http://www.cryptolayer.io/channels/save');
		x.setRequestHeader("Content-type","application/JSON");
		x.onreadystatechange = function() {
			if (x.readyState==4){
				if(x.status==200){
					sendResponse({success : true, response : x.responseText});
				} else {
					console.log('failed to save channelObj. XHR response : ');
					console.log(x);
					sendResponse({success : false, response : x.responseText});
				}
			}
		};
		x.send(JSON.stringify(request.channelObj));
	} else {
		console.log('Invalid Channel Object');
		sendResponse({success : false, response : 'Invalid Channel Object'});
	}
}


function loadChannelObj (request, sender, sendResponse) {
	// validate request.messageObj 			//@TODO : better validation for onmessage object
	if(request.origin_url){
		// check if channels for url is cached in Cyphor
		var local_channels = getModel(['channels', request.origin_url]);
		if(Array.isArray(local_channels)){
			sendResponse({success : true, response : local_channels})
		} else {
			loadChannelsRemote(request, function (channelsArr) {
				sendResponse({success : true, response : channelsArr});
			})
		}


		console.log('getting channels for '+request.origin_url);

	} else {
		console.log('Invalid origin_url');
		sendResponse({success : false, response : 'Invalid origin_url'});
	}
}

function loadChannelsRemote (request, callback) {
	var x = new XMLHttpRequest();
	x.open('GET','http://www.cryptolayer.io/channels/load?origin_url='+request.origin_url);
	x.onreadystatechange = function() {
		console.log(x.status);
		if (x.readyState==4 && x.status==200){
			console.info('loadedChannelsFromServer', x)
			var responseBody = JSON.parse(x.responseText);
			callback(responseBody.message);
		} else if(x.readyState == 4 && x.status != 200){
			console.error('FAILED SERVER REQUEST', x);
		}
	};
	x.send();
}