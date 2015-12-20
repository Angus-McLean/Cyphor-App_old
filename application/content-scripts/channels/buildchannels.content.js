// buildchannels.content.js
console.log('loaded buildchannels.content.js');

var global_target;
var global_input;
var buildChannelPath_triggered;

var waitingForInputSelect;
var waitingForTitleSelect;

function triggerChannelSelection() {
	
	addGreyOverlay();
	waitingForInputSelect = true;
}

function parseForChannelPath (eventObj) {

	if(waitingForInputSelect){
		eventObj.preventDefault();
		eventObj.stopPropagation();

		var activeElement = document.activeElement;
		if(activeElement.type == 'textarea' || activeElement.type == 'input'){
			waitingForTitleSelect = true;
			// document.getElementById('cryptolayer-directions').innerHTML = 'Now click on the name of the recipient.'
			global_input = activeElement;
			console.log('input element : ');
			console.log(global_input);
		} else {
			console.log('element needs to be of type textarea or input');
		}
		waitingForInputSelect = false;

	} else if(waitingForTitleSelect){
		eventObj.preventDefault();
		eventObj.stopPropagation();

		var path = [];
		
		var targetChannel_Identifier = eventObj.target;
		while(targetChannel_Identifier.innerText == ''){
			targetChannel_Identifier = targetChannel_Identifier.parentElement;
		}
		
		cur_elem = global_input

		while(!cur_elem.contains(targetChannel_Identifier)){
			cur_elem = cur_elem.parentElement;
			path.push('^');
		}
		path.push(getContainingElemPath(cur_elem, targetChannel_Identifier));
		var next_elem = cur_elem.querySelectorAll(path[path.length-1])[0]
		while(next_elem){
			cur_elem = next_elem;
			var tempPath = getContainingElemPath(cur_elem, targetChannel_Identifier);
			path.push(tempPath)
			next_elem = cur_elem.querySelectorAll(getContainingElemPath(cur_elem, targetChannel_Identifier))[0]
		}
		path.pop();
		path = path.join('\t');

		global_target = targetChannel_Identifier;

		console.log(cur_elem);
		console.log(path);

		var channel_name = targetChannel_Identifier.innerText;
		var channel_id = saveChannelObj(path, targetChannel_Identifier.innerText);

		if(channels[path]){
			channels[path].push(targetChannel_Identifier.innerText)
		} else {
			channels[path] = [targetChannel_Identifier.innerText];
		}

		var channel_invitation_msg = 'Hello '+channel_name+'! This channel is now encrypted! Here is the channel_id : ';

		removeGreyOverlay();

		buildChannelPath_triggered = false;
		waitingForTitleSelect = false;
	}
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

	// var directions_div = document.createElement('div');
	// direction_style = 'pointer-events:none;';
	// direction_style += 'position: fixed;';
	// direction_style += 'top: 0;';
	// direction_style += 'left: 0;';
	// direction_style += 'bottom: 0;';
	// direction_style += 'right: 0;';
	// direction_style += 'font-size: 80px;';
	// direction_style += 'text-align: center';
	// direction_style += 'z-index: 100501;';
	// //direction_style += 'overflow: hidden;';

	// directions_div.innerHTML = 'Choose the input field';

	// directions_div.setAttribute('style', direction_style);
	// directions_div.setAttribute('id','cryptolayer-directions');

	// document.body.appendChild(directions_div)

	document.body.appendChild(div_elem);
}

function removeGreyOverlay () {
	document.getElementById('cryptolayer-overlay').remove();
	// document.getElementById('cryptolayer-directions').remove()
}