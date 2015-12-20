// encrypt.content.js
console.log('loaded encrypt.content.js');

function encryptString(message){
	var randomKey = Math.random().toString()+Math.random().toString();
	randomKey = '1234567890';
	//randomKey = (randomKey.replace(/\./g,'')).substring(0,16);
	//var encryptionKey = randomKey.split('');
	

	var encrypted = CryptoJS.AES.encrypt(message, randomKey);
	var encryptedMessage = encrypted.toString()

	var messageID = Date.now() + Math.random().toString().substring(2,6);
	var encryptedText = CryptoLayer.constants.mesID_beginIdentifier+messageID+CryptoLayer.constants.mesID_endIdentifier+CryptoLayer.constants.mesText_beginningIdentifier+encryptedMessage+CryptoLayer.constants.mesText_endMessageIdentifier;

	// execute write request to server //
	//writeMessage(messageID,randomKey, intendendRecipient);

	return encryptedText;
}

function encryptSelection (selectionObj) {
	var selectedText = selectionObj.toString();
	if(selectedText !== null && selectedText.length >= 0){
		var messageMatchArr = selectedText.match(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'[a-zA-Z0-9]+'+CryptoLayer.constants.mesID_endIdentifier+CryptoLayer.constants.mesText_beginningIdentifier+'.+'+CryptoLayer.constants.mesText_endMessageIdentifier, 'g'));
		if(messageMatchArr == null || messageMatchArr.length == 0){
			var message = selectionObj.toString()

			var encryptedText = encryptedString(message);

			replaceSelectedText(encryptedText);


		}
	}
}