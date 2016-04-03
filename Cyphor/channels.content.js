// channels.content.js

(function () {
	
	console.log('channel.content.js');

	// define channels module : 
	window.Cyphor.channels = {
		build : initSaveChannel,
		addToIndex : indexChannelObj,
		index : {
			paths : {
				active : {},
				selection : {},
				clicked : {},
				recipient : {},
				active_recipient : {},
				recipient_active : {},
				selection_recipient : {},
				recipient_selection : {},
				clicked_recipient : {},
				recipient_clicked : {}
			},
			relative : {},
			selectors : {}
		},
		tempChannel : {}
	};

	// state : RECIPIENT, EDITABLE, ACTIVE
	var state = null;

	var channelObj = {};

	function initSaveChannel () {
		var tempChannel = {};
		window.Cyphor.channels.tempChannel = tempChannel;
		// state = 'RECIPIENT';
		addGreyOverlay();

		// prevent user click from passing through
		document.body.addEventInterceptor('keyup', prevent);
		document.body.addEventInterceptor('keypress', prevent);
		// add escape listener
		document.body.addEventInterceptor('keydown', function (eve) {
			if(eve.keycode == 27){
				// remove overlay
				removeGreyOverlay();
				
				// reset tempChannel
				window.Cyphor.channels.tempChannel = {};
				
				// remove all interceptors
				document.body.removeEventInterceptor('mousedown', true);
				document.body.removeEventInterceptor('mouseup', true);
				document.body.removeEventInterceptor('click', true);
				document.body.removeEventInterceptor('keydown', true);

				// prevent propagation
				return prevent(eve)
			}
		});



		// prevent user click from passing through
		document.body.addEventInterceptor('mouseup', prevent);
		document.body.addEventInterceptor('click', prevent);
		// add click interceptor
		document.body.addEventInterceptor('mousedown', function (eve) {
			// log recipient
			if(!tempChannel.recipient_elem){
				if(eve.target.innerText && eve.target.innerText != ''){
					tempChannel.recipient_elem = eve.target;
					prevent(eve);
				}
			} else if(!tempChannel.clicked_elem){
				// watch for click to editable element
				if(eve.target){
					tempChannel.clicked_elem = eve.target;

					// let this event pass through and remove other input interceptors
					document.body.removeEventInterceptor('mousedown', true);
					document.body.removeEventInterceptor('mouseup', true);
					document.body.removeEventInterceptor('click', true);

					// listen for removal of clicked element(ie linkedin)
					CyphorObserver.on('remove', tempChannel.clicked_elem, function (mutationRecord) {
						//@TODO : set up so that it handle characterData too
						if(mutationRecord.type == 'childList'){
							// element was removed or changed.. check if its a configured channel
							tempChannel.parent_elem = mutationRecord.target;
						}
					});

					setTimeout(function () {
						// wait for all events to propagate in target page..
						// get active element
						tempChannel.active_elem = document.activeElement;

						// assume that if that element was going to be removed it would be removed by now
						CyphorObserver.removeObserver(tempChannel.clicked_elem);

						// set the editable element
						if(tempChannel.parent_elem){
							tempChannel.editable_elem = tempChannel.active_elem;
						} else {
							tempChannel.editable_elem = tempChannel.clicked_elem;
						}
						
						// save and create channel
						var savedChannelObj = saveChannelObj(eve);
						Cyphor.iframes.create(Cyphor.channels.tempChannel, savedChannelObj);

						state = null;
						removeGreyOverlay();
					}, 5);
				}
			}

		});


	}

	function prevent (eve) {
		eve.stopPropagation();
		eve.preventDefault();			
		return false;
	}

/*
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

				if(!document.contains(Cyphor.channels.tempChannel.editable_elem) && Cyphor.channels.tempChannel.editable_elem.style.display != 'none'){
					// the clicked element was probably some kind of input box prompt.. which is now gone
					window.Cyphor.channels.tempChannel.editable_elem = document.activeElement;
				}
				
				var savedChannelObj = saveChannelObj(eve);

				Cyphor.iframes.create(Cyphor.channels.tempChannel, savedChannelObj);

				state = null;
				removeGreyOverlay();
			}, 0);
		}
	}
*/

	function buildPathObj (eve, tempChannel) {
		var recipElem = tempChannel.recipient_elem;

		// account for iframes
		var parentDocument = (document.activeElement.nodeName == 'IFRAME') ? document.activeElement.contentDocument : document;

		var paths = {
			editable : Cyphor.dom.getFullPath(tempChannel.editable_elem).replace(/ > /g,'\u0000> ').split('\u0000'),
			editable_recipient : Cyphor.dom.buildPath(tempChannel.editable_elem, recipElem),
			recipient_editable : Cyphor.dom.buildPath(recipElem, tempChannel.editable_elem),
			
			active : Cyphor.dom.getFullPath(parentDocument.activeElement).replace(/ > /g,'\u0000> ').split('\u0000'),
			active_recipient : Cyphor.dom.buildPath(parentDocument.activeElement, recipElem),
			recipient_active : Cyphor.dom.buildPath(recipElem, parentDocument.activeElement),
			
			selection : Cyphor.dom.getFullPath(parentDocument.getSelection().baseNode).replace(/ > /g,'\u0000> ').split('\u0000'),
			selection_recipient : Cyphor.dom.buildPath(parentDocument.getSelection().baseNode, recipElem),
			recipient_selection : Cyphor.dom.buildPath(recipElem, parentDocument.getSelection().baseNode),
			
			clicked : Cyphor.dom.getFullPath(eve.target).replace(/ > /g,'\u0000> ').split('\u0000'),
			clicked_recipient : Cyphor.dom.buildPath(eve.target, recipElem),
			recipient_clicked : Cyphor.dom.buildPath(recipElem , eve.target),
		}
		return paths;
	}

	function buildSelectors (eve, tempChannel) {
		var recipElem = tempChannel.recipient_elem;
		var selectors = {
			editable : {
				id : (tempChannel.editable_elem.id) ? ('#'+tempChannel.editable_elem.id) : null,
				class : Cyphor.dom.getClassSelector(tempChannel.editable_elem),
				attr : Cyphor.dom.getAttrSelector(tempChannel.editable_elem)
			},
			active : {
				id : (document.activeElement.id) ? ('#'+document.activeElement.id) : null,
				class : Cyphor.dom.getClassSelector(document.activeElement),
				attr : Cyphor.dom.getAttrSelector(document.activeElement)
			},
			selection : {
				id : (window.getSelection().baseNode.id) ? ('#'+window.getSelection().baseNode.id) : null,
				class : Cyphor.dom.getClassSelector(window.getSelection().baseNode),
				attr : Cyphor.dom.getAttrSelector(window.getSelection().baseNode)
			},
			clicked : {
				id : (eve.target.id) ? ('#'+eve.target.id) : null,
				class : Cyphor.dom.getClassSelector(eve.target),
				attr : Cyphor.dom.getAttrSelector(eve.target)
			},
			recipient : {
				id : (recipElem.id) ? ('#'+recipElem.id) : null,
				class : Cyphor.dom.getClassSelector(recipElem),
				attr : Cyphor.dom.getAttrSelector(recipElem)
			},
		};
		return selectors;
	}

	function saveChannelObj (eve) {
		var t = window.Cyphor.channels.tempChannel;

		var channel_id = Date.now() + Math.random().toString().substring(2,6);
		var channelObj = {
			origin_url : window.location.host,
			channel_paths : Cyphor.dom.buildPath(t.editable_elem, t.recipient_elem),
			channel_name : (t.recipient_elem.innerText != '') ? t.recipient_elem.innerText : t.recipient_elem.value,
			channel_id : channel_id,
			active : true,
			paths : buildPathObj(eve, t),
			selectors : buildSelectors(eve, t)
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

			handleIndexing(channelObj);

		});

		return channelObj;
	}

	function handleIndexing (channelObj) {
		// depricated version of channel index
		indexChannelObj(channelObj);

		// index to relative paths
		indexChannelObjByPaths(channelObj.paths, Cyphor.channels.index.paths, channelObj);

		// index all the selectors
		for(var i in channelObj.selectors){
			Cyphor.channels.index.selectors[i] = (Cyphor.channels.index.selectors[i]) ? Cyphor.channels.index.selectors[i] : {};
			indexChannelObjByPaths(channelObj.selectors[i], Cyphor.channels.index.selectors[i], channelObj);
		}
	}


	function indexChannelObjByPaths (pathObj, destinationObj, valToPush) {

		for(var i in pathObj){
			var pathString;
			if(!pathObj[i]){
				continue;
			}else if(Array.isArray(pathObj[i])){
				pathString = pathObj[i].join('\t');
			} else {
				pathString = pathObj[i];
				//pathObj[i] = pathObj[i].split('\t');			//@TODO : try taking this line out some time
			}

			destinationObj[i] = destinationObj[i] || {};

			if(destinationObj[i][pathString]){
				destinationObj[i][pathString].push(valToPush);
			} else {
				destinationObj[i][pathString] = [valToPush];
			}
		}
	}

	function indexChannelObj (channelObj) {
		var pathString;
		if(Array.isArray(channelObj.channel_paths)){
			pathString = channelObj.channel_paths.join('\t');
		} else {
			pathString = channelObj.channel_paths;
			channelObj.channel_paths = channelObj.channel_paths.split('\t');
		}

		if(window.Cyphor.channels.index.relative[pathString]){
			window.Cyphor.channels.index.relative[pathString].push(channelObj);
		} else {
			window.Cyphor.channels.index.relative[pathString] = [channelObj];
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
	// window.addEventListener('click', logChannelElems, true);
	// window.addEventListener('keydown', function (eve) {
	// 	if(eve.keycode == 27 && state != null){
	// 		removeGreyOverlay();
	// 		window.Cyphor.channels.tempChannel = {};
	// 		state = null;
	// 		eve.stopPropagation()
	// 		eve.preventDefault();
	// 		return false;
	// 	}
	// }, true);

	chrome.runtime.onMessage.addListener(function (msgObj) {
		if(msgObj.action == 'BROWSER_ACTION'){
			initSaveChannel();
		}
	})

})();