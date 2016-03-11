// iframes.content.js

(function () {

	//var Cyphor = window.Cyphor;

	var iframeMod = {
		list : [],
		create : createIframe
	};

	window.Cyphor.iframes = iframeMod;

	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

	// Listen to message from child window
	eventer(messageEvent,function(e) {
		var frameMessageEvent = e;
		var key = e.message ? "message" : "data";
		var data = e[key];
		if(e.origin == 'https://www.cyphor.io'){
			e.preventDefault();
			e.stopPropagation();

			if(data.action == 'MESSAGE'){
				
				console.log('iframe message :', e);
				
				// swap display of iframe and target elem
				var sourceFrameObj = iframeMod.list.filter(function (frameObj) {
					return frameMessageEvent.source == frameObj.iframe.contentWindow
				});
				
				if(sourceFrameObj && sourceFrameObj.length == 1){
					enterEncryptedText(sourceFrameObj[0], data);
				} else {
					console.error('found '+sourceFrameObj.length+' source iframeObjs for this message');
				}

			}
		}
		return false;
	},true);
	
	function enterEncryptedText (sourceFrameObj, messageObj) {
		
		sourceFrameObj.isTyping = true;
		sourceFrameObj.iframe.style.display = 'none';
		sourceFrameObj.targetElem.style.display = '';

		messageObj.coords = sourceFrameObj.coords;



		// send message to background so it can be typed
		chrome.runtime.sendMessage(null, messageObj, null, function () {
			console.log('received response from background, sent iframe message', arguments);

			// finished typing
		
			console.log('Setting back iframe display')
			sourceFrameObj.targetElem.style.display = 'none';
			sourceFrameObj.iframe.style.display = '';
			sourceFrameObj.isTyping = false;
			
			setTimeout(function () {
				sourceFrameObj.iframe.focus();
				sourceFrameObj.iframe.contentWindow.postMessage({action:'FOCUS'}, '*');
				if(sourceFrameObj.iframe.contentWindow){
					sourceFrameObj.iframe.contentWindow.focus();
				}
			},50);
		});
	}

	function getCoords (elem) {
		var rect = elem.getClientRects()[0];
		var x = parseInt(rect.left + (rect.right - rect.left)/2);
		var y = parseInt(rect.top + (rect.bottom - rect.top)/2);
		return {x:x,y:y};
	}
/*
	function insertIframe (siblingElem) {
		// insert iframe

		var inputElem = siblingElem;
		inputElem.style.display = "none";

		var iframe = document.createElement('iframe');


		iframe.allowtransparency = "true";
		iframe.frameborder = "0";
		iframe.scrolling = "no";
		iframe.style.width = "100%";
		iframe.style.height = "100%";
		iframe.style.overflow = "hidden";
		iframe.style.border = "0px none transparent";
		iframe.style.padding = "0px";


		iframe.src = "https://www.cyphor.io/iframe/div.iframe.html";
		inputElem.parentElement.appendChild(iframe);

		return iframe;
	}
*/
	function insertIframe (siblingElem) {

		var parStyle = window.getComputedStyle(siblingElem.parentElement);
		var parStyleJSON = JSON.parse(JSON.stringify(parStyle));
		//parStyleJSON.length = parStyle.length;

		var targetStyle = window.getComputedStyle(siblingElem);
		var targetStyleJSON = JSON.parse(JSON.stringify(targetStyle));
		//targetStyleJSON.length = targetStyle.length;

		var messageObj = {
			action : 'INSERT',
			parent : {
				styles : parStyleJSON,
				type : siblingElem.parentElement.nodeName.toLowerCase()
			},
			target : {
				styles : targetStyleJSON,
				type : siblingElem.nodeName.toLowerCase()
			}
		}

		console.log(messageObj);
		// create the iframe Element

		var iframe = document.createElement('iframe');

		iframe.allowtransparency = "true";
		iframe.frameborder = "0";
		iframe.scrolling = "no";
		iframe.style.width = parStyleJSON.width;
		iframe.style.height = parStyleJSON.height;
		iframe.style.overflow = "hidden";
		iframe.style.border = "0px none transparent";
		iframe.style.padding = "0px";

		iframe.src = "https://www.cyphor.io/iframe/div.iframe.html";
		siblingElem.parentElement.appendChild(iframe);

		iframe.onload = function () {
			//iframe.contentWindow.postMessage({action:'INSERT'}, '*', [messageObj])
			iframe.contentWindow.postMessage(messageObj, '*');
			iframe.focus();
			iframe.contentWindow.postMessage({action:'FOCUS'}, '*');

			if(iframe.contentWindow){
				iframe.contentWindow.focus();
			}
		}

		siblingElem.style.display = 'none';

		return iframe;
	}

	function verifyIfSavedChannel (start_node, channelPathObj) {
		
		var recipElem;
		for(var i in channelPathObj){
			var channel_path_arr = i.split('\t');
			recipElem = window.Cyphor.dom.traversePath(start_node, channel_path_arr);
			if(recipElem){
				var recipName = recipElem.innerText;
				var savedChannel = channelPathObj[i].filter(function (chanObj) {
					return chanObj.channel_name == recipName;
				});
				if(savedChannel && savedChannel.length){
					return savedChannel
				}
			}
		}
		return false;
	}

	function handleInputClick (eve) {
		if(eve.target.type == 'textarea' || eve.target.type == 'input' || eve.target.isContentEditable){
			var activeChannel = verifyIfSavedChannel(eve.target, window.Cyphor.channels.index);
			if(activeChannel){

				var existingFrame = iframeMod.list.filter(function (frameObj) {
					return eve.target == frameObj.targetElem
				});

				if(existingFrame && existingFrame.length){
					if(!existingFrame[0].isTyping){
						existingFrame[0].targetElem.style.display = 'none';
						existingFrame[0].iframe.style.display = '';
					}
				} else {
					createIframe(eve.target, activeChannel);
				}
			}
		}
	}

	function createIframe (siblingElem, channelObj) {
		var coords = getCoords(siblingElem)
		var insertedFrame = insertIframe(siblingElem);
		
		var cyphorInputObj = {
			iframe : insertedFrame,
			channel : channelObj,
			targetElem : siblingElem,
			coords : coords
		};
		iframeMod.list.push(cyphorInputObj);
	}

	window.addEventListener('click', handleInputClick, true);


	// watch for removal of iframe
	// observe inserted encrypted text nodes
	var iframeRemovalObserver = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			if(mut.removedNodes.length){
				for(var i=0;i<mut.removedNodes.length;i++){
					if(mut.removedNodes[i].querySelectorAll){
						var removedFrames = mut.removedNodes[i].querySelectorAll('iframe');
						if(removedFrames && removedFrames.length){
							
							for(var j=0;j<removedFrames.length;j++){
								
								var existingFrameInd,
									curFrame = removedFrames[j];


								Cyphor.iframes.list.forEach(function (cyphFrame, ind, arr) {
									if(curFrame == cyphFrame.iframe){
										// get selector for sibling elem
										var path = Cyphor.dom.getFullPath(cyphFrame.targetElem);
										
										// mut.target gives the parent node that has remained in the DOM. Query full path relative to that element.
										var newTarg = mut.target.querySelectorAll(path);
										if(newTarg && newTarg.length && verifyIfSavedChannel(newTarg, Cyphor.channels.index)){
											// create a new identical iFrame
											createIframe(newTarg[0], Cyphor.iframes.list[ind].channel);
										}
										arr.splice(ind, 1);
									}
								});
							}
						}
					}
				}
			}
		})
	});

	var iframeObsParams = {
		subtree : true,
		childList: true,
	}

	iframeRemovalObserver.observe(document, iframeObsParams)

})();