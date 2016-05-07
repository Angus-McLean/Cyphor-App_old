// iframes.content.js

(function () {

	//var Cyphor = window.Cyphor;

	var iframeMod = {
		list : [],
		create : createIframe,
		insertIframe : insertIframe,
		verifyIfSavedChannel : verifyIfSavedChannel,
		verifyIfSavedChannelByRecipient : verifyIfSavedChannelByRecipient
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

			
			console.log('iframe message :', e);
			
			// swap display of iframe and target elem
			var sourceFrameObj = iframeMod.list.filter(function (frameObj) {
				return frameMessageEvent.source == frameObj.iframe.contentWindow
			});

			if(data.action == 'MESSAGE'){
				if(sourceFrameObj && sourceFrameObj.length == 1){
					enterEncryptedText(sourceFrameObj[0], data);
				} else {
					console.error('found '+sourceFrameObj.length+' source iframeObjs for this message');
				}
			} else if (data.action == 'SUBMIT_BUTTON'){
				if(sourceFrameObj && sourceFrameObj.length == 1){
					enterEncryptedText(sourceFrameObj[0], data);
				} else {
					console.error('found '+sourceFrameObj.length+' source iframeObjs for this message');
				}
			}

			e.preventDefault();
			e.stopPropagation();

		}
		return false;
	},true);
	
	function enterEncryptedText (sourceFrameObj, messageObj) {
		
		sourceFrameObj.isTyping = true;
		sourceFrameObj.iframe.style.display = 'none';
		sourceFrameObj.targetElem.style.display = '';

		sourceFrameObj.targetElem.focus();
		console.log('content focused on target elem.', document.activeElement);

		messageObj.coords = getCoords(sourceFrameObj.targetElem);

		// send message to background so it can be typed
		chrome.runtime.sendMessage(null, messageObj, null, function () {
			console.log('received response from background, sent iframe message', arguments);		
			
			// reset display of iframe
			if(sourceFrameObj.targetElem){
				sourceFrameObj.targetElem.style.display = 'none';
			}			
			if(document.contains(sourceFrameObj.iframe)){
				console.log('Setting back iframe display')
				sourceFrameObj.iframe.style.display = '';
			}
			sourceFrameObj.isTyping = false;
			
			// refocus on iframe once displaying
			setTimeout(function () {
				if(sourceFrameObj.iframe && sourceFrameObj.iframe.contentWindow){
					sourceFrameObj.iframe.focus();
					sourceFrameObj.iframe.contentWindow.postMessage({action:'FOCUS'}, '*');
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
	function insertIframe (siblingElem, channelObj) {

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

			// send channel object to iframe
			iframe.contentWindow.postMessage({
				action:'CHANNEL',
				channel:channelObj || null
			}, '*');

			iframe.contentWindow.postMessage(messageObj, '*');
			iframe.focus();
			iframe.contentWindow.postMessage({action:'FOCUS'}, '*');

			if(iframe.contentWindow){
				iframe.contentWindow.focus();
			}
		}
		siblingElem.originalDisplay = (siblingElem.style) ? siblingElem.style.display : '';
		siblingElem.style.display = 'none';

		return iframe;
	}

	//@TODO : add error handling when find multiple configured channels
	function verifyIfSavedChannel (start_node, channelObjIndex) {
		
		var recipElem;
		for(var i in channelObjIndex){
			var channel_path_arr = i.split('\t');
			recipElem = window.Cyphor.dom.traversePath(start_node, channel_path_arr, true);
			if(recipElem){
				var recipName = recipElem.innerText;
				var savedChannel = channelObjIndex[i].filter(function (chanObj) {
					return chanObj.channel_name == recipName;
				});
				if(savedChannel && savedChannel.length){
					return savedChannel[0]
				}
			}
		}
		return false;
	}

	function verifyIfSavedChannelByRecipient (recipient_node, channelObjIndex) {
		// quick validate of recipient node
		if(!recipient_node.innerText || recipient_node.innerText == ''){
			return false;
		}

		var finalChannel = [];

		// iterate all channels
		for(var i in channelObjIndex){

			var recipChannels = channelObjIndex[i].filter(function (chanObj) {
				return chanObj.channel_name == recipient_node.innerText;
			});
			// there are channels that exist with that recipient name
			if(recipChannels.length){

				recipChannels.forEach(function (chan) {
					var editable_elem = window.Cyphor.dom.traversePath(recipient_node, chan.paths.recipient_editable, true);

					// validate that the destination element is a valid input element
					if(editable_elem && (editable_elem.isContentEditable || editable_elem.tagName == 'INPUT' || editable_elem.tagName == 'TEXTAREA')){
						finalChannel.push({
							elementsObj : {
								editable_elem : editable_elem,
								recipient_elem : recipient_node
							},
							channel : chan
						});
					}
				});
				
			}
		}

		if(finalChannel.length == 1){
			return finalChannel[0];
		} else if(finalChannel.length > 1){
			throw 'verifyIfSavedChannelByRecipient found multiple configured channels for this recipient element';
		} else {
			return false;
		}
	}

/*
	// Recurses through Node Tree and returns first configured channel
	
	// function verifyIfSavedChannelRecursive (start_node, channelObjIndex) {
		
	// 	var curChan = verifyIfSavedChannel(start_node, channelObjIndex);
	// 	if(curChan){
	// 		return {
	// 			channel : curChan,
	// 			element : start_node
	// 		}
	// 	} else {
	// 		if(start_node.children){
	// 			var childChan = false;
	// 			start_node.children.forEach(function (childNode) {
	// 				var testChan = verifyIfSavedChannelRecursive(childNode);
	// 				if(testChan){
	// 					childChan = testChan
	// 				}
	// 			});
	// 			return childChan;
	// 		} else {
	// 			return false;
	// 		}
			
	// 	}
	// }
*/

	function handleInputClick (eve) {
		if(eve.target.type == 'textarea' || eve.target.type == 'input' || eve.target.isContentEditable){
			var activeChannel = verifyIfSavedChannel(eve.target, window.Cyphor.channels.index.relative);
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
					createIframe({editable_elem:eve.target}, activeChannel);
				}
			}
		}
	}

	function createIframe (elemsObj, channelObj) {
		

		var targetElem = elemsObj.editable_elem || elemsObj;			//@TEMP : just so createIframe is backwards compatible
		if(targetElem.CyphorInput){
			return;
		}

		// check if cyphorInput Obj already exists
		var existing = iframeMod.list.filter(function (cyphorInputObj) {
			return cyphorInputObj.channel == channelObj;
		});
		
		if(existing && existing.length){
			existing[0].targetElem = targetElem;
			existing[0].recipientElem = elemsObj.recipient_elem || existing[0].recipientElem;
			existing[0].listenForRecipientElemChange();
			existing[0].insertIframe();
		} else {
			//var coords = getCoords(targetElem)
			//var insertedFrame = insertIframe(targetElem);
			
			var cyphorInputObj = new CyphorInput(elemsObj, channelObj);

			//cyphorInputObj.iframe = insertedFrame;
			//cyphorInputObj.channel = channelObj;
			//cyphorInputObj.targetElem = targetElem;
			//cyphorInputObj.coords = coords;
			
			// add references to the cyphorInput Object
			iframeMod.list.push(cyphorInputObj);
			targetElem.CyphorInput = cyphorInputObj;
		}
	}

	window.addEventListener('click', handleInputClick, true);

/*
	// watch for removal of iframe
	var iframeRemovalObserver = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			if(mut.removedNodes.length){
				for(var i=0;i<mut.removedNodes.length;i++){
					if(mut.removedNodes[i].querySelectorAll){
						var removedFrames = mut.removedNodes[i].querySelectorAll('iframe');
						if(removedFrames && removedFrames.length){

							
							for(var j=0;j<removedFrames.length;j++){
								
								var curFrame = removedFrames[j];

								Cyphor.iframes.list.forEach(function (cyphFrame, ind, arr) {
									if(curFrame == cyphFrame.iframe){
										// get selector for sibling elem
										var query = cyphFrame.channel.paths.recipient_editable.slice(cyphFrame.channel.paths.recipient_editable.lastIndexOf('^')+1).join('').replace(/:scope/g,'').replace(/\:nth\-child\([0-9]+\)/g,'');
										
										// mut.target gives the parent node that has remained in the DOM. Query full path relative to that element.
										var newTarg = mut.target.querySelectorAll(query.replace(/^ *> * ?/,'')+' '+cyphFrame.channel.selectors.editable.class);
										console.log('<query> gave following <target> from <mutation record>',query.replace(/^ *> * ?/,'')+' '+cyphFrame.channel.selectors.editable.class, newTarg, mut);
										if(newTarg && newTarg.length && verifyIfSavedChannel(newTarg[0], Cyphor.channels.index.relative)){
											// create a new identical iFrame
											createIframe({editable_elem:newTarg[0]}, Cyphor.iframes.list[ind].channel);
										}
										//arr.splice(ind, 1);
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
*/

	//@TODO : move this to the channels module...
	// watch for new channels in the page
	var inputInsertion = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			Array.prototype.forEach.call(mut.addedNodes, function (addedNode) {
				
				// check by input elements
				var resObj = Cyphor.dom.parseNodeForActiveInputs(addedNode);
				if(resObj){
					createIframe(resObj.elementsObj, resObj.channel);
				} else if(addedNode.querySelectorAll && addedNode.querySelectorAll('input', 'textarea', '[contenteditable=true]').length){
					// account for times where elements are still being added so parsing fails to detect the configured channel as the entire DOM portion isn't inserted yet
					setTimeout(function () {
						var resObj = Cyphor.dom.parseNodeForActiveInputs(addedNode);
						if(resObj){
							createIframe(resObj.elementsObj, resObj.channel);
						}
					}, 10);
				}


				
				// check by possible recipient elements
				var recipObj = Cyphor.dom.parseNodeForActiveRecipients(addedNode);
				if(recipObj){
					createIframe(recipObj.elementsObj, recipObj.channel);
				}

			});
		});
	});
	var newInputsObserverConfig = {
		subtree : true,
		childList: true,
	}
	inputInsertion.observe(document, newInputsObserverConfig)
/*
	// change to contenteditable
	var contenteditableChangeObs = new MutationObserver(function (muts) {
		muts.filter(function (m) {
			return m.type == 'attributes';
		}).forEach(function (mut) {
			var resObj = parseNodeForActiveInputs(mut.target.parent);
			if(resObj){
				createIframe(resObj.elementsObj, resObj.channel);
			} else if(addedNode.querySelectorAll && addedNode.querySelectorAll('input', 'textarea', '[contenteditable=true]').length){
				// account for times where elements are still being added so parsing fails to detect the configured channel as the entire DOM portion isn't inserted yet
				setTimeout(function () {
					var resObj = parseNodeForActiveInputs(addedNode);
					if(resObj){
						createIframe(resObj.elementsObj, resObj.channel);
					}
				}, 10);
			}
		});
	});
	var contenteditableChangeParams = {
		subtree : true,
		childList: true,
		attributes: true,
		attributeFilter: ['contenteditable']
	};
	contenteditableChangeObs.observe(document, contenteditableChangeParams);
*/
})();