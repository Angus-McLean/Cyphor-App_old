// CyphorInput.content.js

(function () {
	window.CyphorInput = function CyphorInput() {
	
		this.iframe = null;
		this.channel = null;
		this.targetElem = null;
		this.coords = null;

		var listeners = {};

		this.addListener = function (eventName, fn) {
			if(listeners[eventName]){
				listeners[eventName].push(fn);
			} else {
				listeners[eventName] = [fn];
			}
		}

		this.emitEvent = function (eventName, eventObject) {
			if(listeners[eventName]) {
				listeners[eventName].forEach(function(fnElem){
					fnElem.call(this, eventObject);
				});
			}
		}
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
	}
})();