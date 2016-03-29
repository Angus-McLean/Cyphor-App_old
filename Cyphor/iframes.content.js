// iframes.content.js

(function () {

	//var Cyphor = window.Cyphor;

	var iframeMod = {
		list : [],
		create : createIframe,
		insertIframe : insertIframe
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

		messageObj.coords = getCoords(sourceFrameObj.targetElem);

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
					createIframe(eve.target, activeChannel);
				}
			}
		}
	}

	function createIframe (siblingElem, channelObj) {
		
		// check if cyphorInput Obj already exists
		var existing = iframeMod.list.filter(function (cyphorInputObj) {
			return cyphorInputObj.channel == channelObj;
		});
		
		if(existing && existing.length){
			existing[0].targetElem = siblingElem;
			existing[0].iframe = insertIframe(siblingElem);
		} else {
			var coords = getCoords(siblingElem)
			var insertedFrame = insertIframe(siblingElem);
			
			var cyphorInputObj = new CyphorInput();

			cyphorInputObj.iframe = insertedFrame;
			cyphorInputObj.channel = channelObj;
			cyphorInputObj.targetElem = siblingElem;
			cyphorInputObj.coords = coords;
			
			iframeMod.list.push(cyphorInputObj);
		}
	}

	window.addEventListener('click', handleInputClick, true);

	// watch for removal of iframe
	var iframeRemovalObserver = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			if(mut.removedNodes.length){
				for(var i=0;i<mut.removedNodes.length;i++){
					if(mut.removedNodes[i].querySelectorAll){
						var removedFrames = mut.removedNodes[i].querySelectorAll('iframe');
						if(removedFrames && removedFrames.length){
							
							//parseNodeForActiveInputs(mut.target);

							
							for(var j=0;j<removedFrames.length;j++){
								
								var curFrame = removedFrames[j];

								Cyphor.iframes.list.forEach(function (cyphFrame, ind, arr) {
									if(curFrame == cyphFrame.iframe){
										// get selector for sibling elem
										var query = cyphFrame.channel.paths.recipient_editable.slice(cyphFrame.channel.paths.recipient_editable.lastIndexOf('^')+1).join('').replace(/:scope/g,'').replace(/\:nth\-child\([0-9]+\)/g,'');
										
										// mut.target gives the parent node that has remained in the DOM. Query full path relative to that element.
										var newTarg = mut.target.querySelectorAll(query.replace(/^ *> */,'')+' '+cyphFrame.channel.selectors.editable.class);
										console.log('<query> gave following <target> from <mutation record>',query.replace(/^ *> */,'')+' '+cyphFrame.channel.selectors.editable.class, newTarg, mut);
										if(newTarg && newTarg.length && verifyIfSavedChannel(newTarg[0], Cyphor.channels.index.relative)){
											// create a new identical iFrame
											createIframe(newTarg[0], Cyphor.iframes.list[ind].channel);
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


	function parseNodeForActiveInputs (node) {
		// quickly query if there's any input or editable elements in the addedNode
		var inputElems = (node.querySelectorAll)?node.querySelectorAll('input', 'textarea', '[contenteditable=true]') : [];

		if(inputElems && inputElems.length){
			// build massive active element query string
			var queryStr = '';

			for(var i in Cyphor.channels.index.selectors.editable){
				for(var j in Cyphor.channels.index.selectors.editable[i]){
					queryStr += j + ', '
				}
			}
			queryStr = queryStr.replace(/, $/,'');

			activeElems = (queryStr && queryStr != '') ? node.querySelectorAll(queryStr) : [];

			if(activeElems.length){
				// iterate array of possible active inputs to see if they're are currently in an active channel
				Array.prototype.forEach.call(activeElems, function (elem) {
					var chanObj = verifyIfSavedChannel(elem, Cyphor.channels.index.relative);
					if(chanObj){
						createIframe(elem, chanObj)
					}
				});
			}
		}
	}

	// watch for channel input elements
	var inputInsertion = new MutationObserver(function(mutations){
		mutations.forEach(function (mut) {
			Array.prototype.forEach.call(mut.addedNodes, function (addedNode) {
				parseNodeForActiveInputs(addedNode)
			})
		})
	});
	var newInputsObserverConfig = {
		subtree : true,
		childList: true,
	}
	inputInsertion.observe(document, newInputsObserverConfig)

	// change to contenteditable
	var contenteditableChangeObs = new MutationObserver(function (muts) {
		muts.filter(function (m) {
			return m.type == 'attributes';
		}).forEach(function (mut) {
			parseNodeForActiveInputs(mut.target);
		});
	});
	var contenteditableChangeParams = {
		subtree : true,
		childList: true,
		attributes: true,
		attributeFilter: ['contenteditable']
	};
	contenteditableChangeObs.observe(document, contenteditableChangeParams);

})();