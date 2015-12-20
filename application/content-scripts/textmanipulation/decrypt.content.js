// decrypt.content.js
console.log('loaded decrypt.content.js');

function decryptedSelection (selectionObj) {

	var selectedText = selectionObj.toString();
	if(selectedText !== null && selectedText.length >= 0){
		var messageMatchArr = selectedText.match(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'[a-zA-Z0-9]+'+CryptoLayer.constants.mesID_endIdentifier+CryptoLayer.constants.mesText_beginningIdentifier+'.+'+CryptoLayer.constants.mesText_endMessageIdentifier, 'g'));
		if(messageMatchArr != null && messageMatchArr.length == 1){

			// execute read request to server //
			var decryptedMessage = decryptFromString(messageMatchArr[0])
			replaceSelectedText(decryptedMessage);
		}
	}
}

function decryptFromString (encryptedString) {
	var messageEncrypted = encryptedString.match(new RegExp(CryptoLayer.constants.mesText_beginningIdentifier+'.+'+CryptoLayer.constants.mesText_endMessageIdentifier, 'g'))[0];
	messageEncrypted = messageEncrypted.replace(new RegExp(CryptoLayer.constants.mesText_beginningIdentifier+'|'+CryptoLayer.constants.mesText_endMessageIdentifier,'g'),'');

	var decryptionKey = '1234567890';

	var decryptedObj = CryptoJS.AES.decrypt(messageEncrypted, decryptionKey);
	var decryptedMessage = decryptedObj.toString(CryptoJS.enc.Utf8)

	return decryptedMessage;
}

function iterateMutationRecord (mutationsArr) {
	if(mutationsArr && mutationsArr.length > 0){
		for(var i=0;i<mutationsArr.length;i++){
			var curMutation = mutationsArr[i]
			if(curMutation.addedNodes && curMutation.addedNodes.length > 0){
				// decrypt added nodes
				for(var k=0;k<curMutation.addedNodes.length;k++){
					decryptNodeTree(curMutation.addedNodes[k]);
				}
			}
		}
	}
}

function decryptNodeTree (node) {
	var elem = getBaseTextNode(node,new RegExp(CryptoLayer.constants.mesID_beginIdentifier));
	while (elem) {
		var val = elem.textContent || elem.innerText;
		var msgID = val.match(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'[0-9]+'+CryptoLayer.constants.mesID_endIdentifier))[0]
		msgID = msgID.replace(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'|'+CryptoLayer.constants.mesID_endIdentifier,'g'),'');

		var messageMatchArr = val.match(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'[a-zA-Z0-9]+'+CryptoLayer.constants.mesID_endIdentifier+CryptoLayer.constants.mesText_beginningIdentifier+'.+'+CryptoLayer.constants.mesText_endMessageIdentifier, 'g'));
		var decryptedMessage = decryptFromString(messageMatchArr[0])
		console.log('Decrypted! msgID : '+msgID+' --> '+decryptedMessage);
		
		elem.textContent = (elem.textContent || elem.innerText).replace(messageMatchArr[0],decryptedMessage)
		
		var elem = getBaseTextNode(node,new RegExp(CryptoLayer.constants.mesID_beginIdentifier));
	}
}


/*
function decryptNodes (arrOfNodes) {
	//console.log(arrOfNodes);
	for(var j=0;j<arrOfNodes.length;j++){
		var val;
		if((!arrOfNodes[j].children || arrOfNodes[j].children.length == 0) && arrOfNodes[j].tagName !== 'INPUT' && arrOfNodes[j].tagName !== 'TEXTAREA' && !arrOfNodes[j].contentEditable !== true){
			val = arrOfNodes[j].innerText;
		}
		
		if(val && val.indexOf(CryptoLayer.constants.mesID_beginIdentifier) >= 0){
			var msgID = val.match(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'[0-9]+'+CryptoLayer.constants.mesID_endIdentifier))[0]
			msgID = msgID.replace(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'|'+CryptoLayer.constants.mesID_endIdentifier,'g'),'');
			console.log('msgID : '+msgID);
			if(encryptedMessageIDs[msgID]){
				continue;
			}
			console.log('val : '+val);
			var messageMatchArr = val.match(new RegExp(CryptoLayer.constants.mesID_beginIdentifier+'[a-zA-Z0-9]+'+CryptoLayer.constants.mesID_endIdentifier+CryptoLayer.constants.mesText_beginningIdentifier+'.+'+CryptoLayer.constants.mesText_endMessageIdentifier, 'g'));
			var decryptedMessage = decryptFromString(messageMatchArr[0])
			console.log('DECRYPTED!!! from : '+arrOfNodes[j].innerText+' -- to : '+arrOfNodes[j].innerText.replace(messageMatchArr[0],decryptedMessage));
			//arrOfNodes[j].innerText = arrOfNodes[j].innerText.replace(messageMatchArr[0],decryptedMessage);
		}
	}
}*/