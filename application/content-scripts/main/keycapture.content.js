//keycapture.content.js
console.log('loaded keycapture.content.js')


function handleKeyDown (eventObj) {
	if(eventObj.target.type == 'input' || eventObj.target.type == 'textarea' || eventObj.target.isContentEditable){
		if(eventObj.keyCode == 13 && verifyIfSavedChannel(eventObj.target)){       // keyCode 13 = enter
			var text = eventObj.target.value;
			console.log('auto encrypting : '+ text);
			eventObj.target.value = encryptString(text);
		}
	}
}