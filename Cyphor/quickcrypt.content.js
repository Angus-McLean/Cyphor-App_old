// quickcrypt.content.js

(function () {

	var quickcrypt_state = null;

	var tempQuickCrypt = {};



	function buildQuickCrypt () {
		if(!quickcrypt_state){
			quickcrypt_state = 'EDITABLE';
			addGreyOverlay();

			// notify user to click on input element
		}
	}

	function handleClick (eve) {
		if(quickcrypt_state == 'EDITABLE'){
			
			tempQuickCrypt.clicked = eve.target;
			var inputElem = eve.target;

			setTimeout(function () {
				if(!document.contains(inputElem)){
					inputElem = document.activeElement;
				}

				// add QuickCrypt config div to page
				addQuickCryptConfig(inputElem);
			}, 0);
		}
	}

	function addQuickCryptConfig (inputElem) {
		//var recipientName = prompt('enter recipient\'s username');
		var recipientName = '';
		removeGreyOverlay();
		Cyphor.iframes.create(inputElem, buildQuickCryptObject(inputElem, recipientName));
		quickcrypt_state = null;
	}

	function buildQuickCryptObject (inputElem, recipient) {
		var quickcryptObj = {
			target : inputElem,
			recipient : recipient
		};
		return quickcryptObj;
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

	window.addEventListener('click', handleClick, true);
	chrome.runtime.onMessage.addListener(function (msgObj) {
		if(msgObj.action == 'quickcrypt'){
			buildQuickCrypt();
		}
	})

	window.Cyphor.quickcrypt = {
		buildQuickCrypt : buildQuickCrypt
	};

})();