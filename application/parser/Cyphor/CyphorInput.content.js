// CyphorInput.content.js

(function () {

	window.CyphorInput = function CyphorInput(elemsObj, channelObj) {

		this.iframe = null;
		this.channel = channelObj || null;
		this.targetElem = elemsObj.editable_elem || null;
		this.recipientElem = elemsObj.recipient_elem || null;
		this.coords = getCoords(this.targetElem);

		// insert the iframe
		this.insertIframe();

		this.listenForRecipientElemChange();

	}

	CyphorInput.prototype.listenForRecipientElemChange = function () {
		var thisCyph = this;
		CyphorObserver.on('remove', this.recipientElem, function (mutationRecord) {
			//@TODO : set up so that it handle characterData too
			if(mutationRecord.type == 'childList'){
				// element was removed or changed.. check if its a configured channel
				var resObj = Cyphor.dom.parseNodeForActiveInputs(thisCyph.targetElem);
				if(resObj && resObj.elementsObj.editable_elem == thisCyph.targetElem && resObj.channel ==  thisCyph.channel){
					// do nothing because its the same channel
				} else {
					// channel has changed.. remove the currently configured CyphorInput
					thisCyph.takeout();
					if(resObj) {
						Cyphor.iframes.create(resObj.elementsObj, resObj.channel);
					}
				}
			}
		});

		// CyphorObserver.on('remove', this.targetElem, function (mutationRecord) {
		// 	//@TODO : set up so that it handle characterData too
		// 	if(mutationRecord.type == 'childList'){
		// 		// element was removed or changed.. check if its a configured channel
				
		// 		thisCyph.takeout();
		// 		var resObj = Cyphor.dom.parseNodeForActiveRecipients(thisCyph.recipientElem);
		// 		if(resObj) {
		// 			Cyphor.iframes.create(resObj.elementsObj, resObj.channel);
		// 		}
		// 	}
		// });
	}

	function getCoords (elem) {
		var rect = elem.getClientRects()[0];
		var x = parseInt(rect.left + (rect.right - rect.left)/2);
		var y = parseInt(rect.top + (rect.bottom - rect.top)/2);
		return {x:x,y:y};
	}

	function prevent (eve) {
		eve.stopPropagation();
		eve.preventDefault();			
		return false;
	}

	CyphorInput.prototype.takeout = function () {
		
		// clear removal observer so it doesn't get reinserted
		CyphorObserver.removeListener('remove', this.iframe);
		CyphorObserver.removeListener('remove', this.targetElem);
		CyphorObserver.removeListener('remove', this.recipientElem);
		
		// take out the iframe
		this.iframe.remove();

		// reset display of original element
		if(this.targetElem.style && this.targetElem.style.display == 'none'){
			this.targetElem.style.display = this.targetElem.originalDisplay
		}

		// clear up memory
		this.destroy();
	}

	// clean up access to prevent memory leaks
	CyphorInput.prototype.destroy = function() {
		//CyphorObserver.removeObserver(this.iframe);

		delete this.targetElem.CyphorInput;
		delete this.iframe.CyphorInput;
	};

	// requires that this object has its targetElem and channel object configured
	CyphorInput.prototype.insertIframe = function() {

		// double check that this element doesn't already have a channel associated with it
		if(this.targetElem.CyphorInput){
			return;
		}
		
		var ifr = Cyphor.iframes.insertIframe(this.targetElem, this.channel);
		this.iframe = ifr;
		
		

		// listen for removal of this iframe and reinsert if channel is still configured
		var thisCyph = this;
		CyphorObserver.on('remove', ifr, function (mutationRecord) {
			if(mutationRecord.type == 'childList'){
				// iframe was removed, create a new CyphorInput Object
				setTimeout(function () {
					var resObj = Cyphor.dom.parseNodeForActiveInputs(mutationRecord.target);
					if(resObj){
						// creates a new iframe element
						Cyphor.iframes.create(resObj.elementsObj, resObj.channel);
					}
				}, 10);
				
				// either a copy has been created or this channel is no longer on the page... delete this instance
				thisCyph.takeout();
			}
		});

		// CyphorObserver.on('remove', this.targetElem, function (mutationRecord) {
		// 	if(mutationRecord.type == 'childList'){
		// 		// iframe was removed, create a new CyphorInput Object
		// 		var resObj = Cyphor.dom.parseNodeForActiveRecipients(thisCyph.recipientElem);
		// 		if(resObj){
		// 			// creates a new iframe element
		// 			Cyphor.iframes.create(resObj.elementsObj, resObj.channel);
		// 		}
		// 		// either a copy has been created or this channel is no longer on the page... delete this instance
		// 		thisCyph.takeout();
		// 	}
		// });

		this.targetElem.parentElement.appendChild(ifr);

		// update references
		this.targetElem.CyphorInput = this;
		this.iframe.CyphorInput = this;
	};

	CyphorInput.prototype.addSendButton = function(buttonElem) {
		var _self = this;
		_self.sendButton = buttonElem;

		buttonElem.addEventInterceptor('mousedown', function (eve) {
			
			// if the CyphorInput is busy inputting text, don't intercept the event
			if(!_self.isTyping){
				_self.isTyping = true;
				_self.iframe.style.display = 'none';
				_self.targetElem.style.display = '';

				// send submit message
				var submitButtonClickMsg = {
					action : 'SUBMIT_BUTTON',
					eventCoords : {
						x : eve.offsetX,
						y : eve.offsetY
					},
					buttonCoords : getCoords(eve.target),
					inputCoords : getCoords(_self.targetElem)
				}
				_self.iframe.contentWindow.postMessage(submitButtonClickMsg, '*');

				// prevent the event from passing
				eve.preventDefault();
				eve.stopPropagation();
				return false;
			}
		});

		function preventUser (eve) {
			// checks if its the chrome extension is typing
			if(!_self.isTyping){
				eve.preventDefault();
				eve.stopPropagation();
				return false;
			}
		}

		// prevent user click from passing through
		buttonElem.addEventInterceptor('mouseup', preventUser);
		buttonElem.addEventInterceptor('click', preventUser);
	};

	CyphorInput.prototype.configureSendButton = function () {
		var _CyphorInputContext = this;
		function clickFn (eve) {
			console.log('captured click');
			_CyphorInputContext.addSendButton(eve.target);

			window.removeEventListener('mousedown', clickFn, true);
			window.removeEventListener('mouseup', prevent, true);
			window.removeEventListener('click', prevent, true);

			eve.stopPropagation();
			eve.preventDefault();
			return false;
		}

		window.addEventListener('mousedown', clickFn, true);
		window.addEventListener('mouseup', prevent, true);
		window.addEventListener('click', prevent, true);
	};
})();