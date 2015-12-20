// walkDOM.content.js
console.log('loaded walkDOM.content.js');

function getContainingElemPath (parentElement, targetElem) {
	var elems = parentElement.childNodes
	for(var i=0;i<elems.length;i++){
		if(elems[i].contains(targetElem)){
			
			// get index of particular element
			var ind;
			var child_elems = parentElement.querySelectorAll(':scope > '+elems[i].nodeName.toLowerCase());
			for(var j=0;j<child_elems.length;j++){
				if(child_elems[j] == elems[i]){
					ind = j;
					if(ind == 0){
						return ':scope > '+elems[i].nodeName.toLowerCase();
					} else {
						return ':scope > '+elems[i].nodeName.toLowerCase()+':nth-child('+(j+1)+')';
					}
					
				}
			}

		}
	}
}

function traversePath(start, pathArr, fuzzyTravers){
	var cur_elem = start;
	for (var i = 0; i < pathArr.length; i++) {
		if(pathArr[i] == '^'){
			try{
				cur_elem = cur_elem.parentElement;
			} catch (e) {
				return null;
			}
			
		} else {
			next_elem = cur_elem.querySelectorAll(pathArr[i])[0];
			if(next_elem === undefined && fuzzyTravers){
				return cur_elem
			} else {
				cur_elem = next_elem;
			}
			
		}
	}
	return cur_elem;
}


function getBaseTextNode (DOM_Node,regex) {
	if(DOM_Node.textContent||DOM_Node.innerText){
		var matchVal = (DOM_Node.textContent||DOM_Node.innerText).match(regex);
	} else {
		matchVal = null;
	}
	
	if(matchVal !== null){
		var nodeTagName = (DOM_Node.tagName || DOM_Node.parentElement.tagName).toUpperCase();
		if(DOM_Node.children && DOM_Node.children.length > 0){
			var child_containsRegex = false;
			for(var i=0;i<DOM_Node.children.length;i++){
				
				if(CryptoLayer.constants.tagsToAvoidDecoding.indexOf(DOM_Node.children[i].tagName.toUpperCase()) >= 0){
					continue;
				}
				var innerNode = getBaseTextNode(DOM_Node.children[i],regex)
				if(innerNode !== false){
					return innerNode;
				}
			}
			if(!child_containsRegex){
				return DOM_Node
			}
		} else if(CryptoLayer.constants.tagsToAvoidDecoding.indexOf(nodeTagName) < 0){
			return DOM_Node;
		} else {
			return false;
		}
	} else {
		return false;
	}
}


//["^", "^", "^", "^", "^", "^", ":scope > div:nth-child(1)", ":scope > div:nth-child(2)", ":scope > h4:nth-child(1)"]
//["^", "^", "^", "^", "^", "^", ":scope > div:nth-child(1)", ":scope > div:nth-child(2)", ":scope > h4:nth-child(1)"]