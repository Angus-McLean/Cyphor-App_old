//messages.background.js
//console.log('loaded messages.background.js');

function saveMessageObj(request, sender, sendResponse) {
	
	if(request.messageObj){
		var x = new XMLHttpRequest();
		x.open('POST','http://www.cryptolayer.io/messages/save');
		x.setRequestHeader("Content-type","application/JSON");
		x.onreadystatechange = function() {
			if (x.readyState==4 && x.status==200){
				sendResponse({success : true, response : x})
			}
		};
		x.send(JSON.stringify(request.messageObj));
	} else {
		console.log('Invalid Message Object');
		sendResponse({success : false, response : 'Invalid Message Object'});
	}
}
