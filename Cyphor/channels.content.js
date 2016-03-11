// channels.content.js

(function () {
	
	console.log('channel.content.js');

	// define channels module : 
	window.Cyphor.channels = {
		build : initSaveChannel,
		addToIndex : indexChannelObj,
		index : {},
		tempChannel : {}
	};

	// state : RECIPIENT, EDITABLE, ACTIVE
	var state = null;

	var channelObj = {};

	function initSaveChannel () {
		window.Cyphor.channels.tempChannel = {};
		state = 'RECIPIENT';
		addGreyOverlay();
	}

	// track important html elements when saving a channel
	function logChannelElems (eve) {
		if(state == 'RECIPIENT'){

			window.Cyphor.channels.tempChannel.recipient_elem = eve.target;
			state = 'EDITABLE';

			eve.preventDefault();
			eve.stopPropagation();

			return false;

		} else if(state == 'EDITABLE'){
			window.Cyphor.channels.tempChannel.editable_elem = eve.target;
			//state = 'ACTIVE';
			state = null;

			setTimeout(function () {
				//window.Cyphor.channels.tempChannel.type_elem = window.getSelection().baseNode;
				//window.Cyphor.channels.tempChannel.type_elem = document.activeElement;
				if(!document.contains(Cyphor.channels.tempChannel.editable_elem) && Cyphor.channels.tempChannel.editable_elem.style.display != 'none'){
					// the clicked element was probably some kind of input box prompt.. which is now gone
					//window.Cyphor.channels.tempChannel.type_elem = document.activeElement;
					window.Cyphor.channels.tempChannel.editable_elem = document.activeElement;;
				}

				// build the channel Object
				var channelPath = Cyphor.dom.buildPath(window.Cyphor.channels.tempChannel.editable_elem, window.Cyphor.channels.tempChannel.recipient_elem);
				var savedChannelObj = saveChannelObj(channelPath, window.Cyphor.channels.tempChannel.recipient_elem.innerText);

				Cyphor.iframes.create(window.Cyphor.channels.tempChannel.editable_elem, savedChannelObj);

				state = null;
				removeGreyOverlay();
			}, 0);
		}
	}

	function saveChannelObj(channel_path, channel_name){
		var channel_id = Date.now() + Math.random().toString().substring(2,6);
		var channelObj = {
			origin_url : window.location.host,
			channel_paths : channel_path,
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
		
		console.log('Saving Channel Obj : ', requestObj);

		chrome.runtime.sendMessage(requestObj, function(response) {
			console.log('PUT /binder/channels finished got following response : ', response);

			indexChannelObj(channelObj);
		});

		// Cyphor is awesome and Sarah love Angus with all her heart! 
		// also you are not allowed to erase this or it will be seen as a sign that your love for me is not true! hehe 
		// p.s. I am the best coder there ever was.

		return channelObj;
	}

	function indexChannelObj (channelObj) {
		var pathString;
		if(Array.isArray(channelObj.channel_paths)){
			pathString = channelObj.channel_paths.join('\t');
		} else {
			pathString = channelObj.channel_paths;
			channelObj.channel_paths = channelObj.channel_paths.split('\t');
		}

		if(window.Cyphor.channels.index[pathString]){
			window.Cyphor.channels.index[pathString].push(channelObj);
		} else {
			window.Cyphor.channels.index[pathString] = [channelObj];
		}
	}

	function addGreyOverlay () {
		var div_elem = document.createElement('div');

		var style_string = 'pointer-events:none;';
		style_string += 'background:#000;';
		style_string += 'opacity:0.5;';
		style_string += 'position:fixed;';
		style_string += 'top:0;';
		style_string += 'left:0;';
		style_string += 'width:100%;';
		style_string += 'height:100%;';
		//style_string += 'display:block;';
		style_string += 'z-index:100500;';
		style_string += 'font-size: 80px;';
	    //style_string += 'line-height: 1;';
		style_string += 'MsFilter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);';
		style_string += 'filter: alpha(opacity=50);';
		style_string += 'MozOpacity: 0.5;';
		style_string += 'KhtmlOpacity: 0.5;';
		style_string += 'content: attr(data-bg-text);';

		div_elem.setAttribute('style', style_string);
		div_elem.setAttribute('id','cryptolayer-overlay');

		document.body.appendChild(div_elem);
	}

	function removeGreyOverlay () {
		document.getElementById('cryptolayer-overlay').remove();
	}


	// Window Event Listeners
	window.addEventListener('click', logChannelElems, true);
	window.addEventListener('keydown', function (eve) {
		if(eve.keycode == 27 && state != null){
			removeGreyOverlay();
			window.Cyphor.channels.tempChannel = {};
			state = null;
			eve.stopPropagation()
			eve.preventDefault();
			return false;
		}
	}, true);

	chrome.runtime.onMessage.addListener(function (msgObj) {
		if(msgObj.action == 'BROWSER_ACTION'){
			initSaveChannel();
		}
	})

})();