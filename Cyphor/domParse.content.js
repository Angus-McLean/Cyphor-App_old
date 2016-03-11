// domParse.content.js

(function () {
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
				if(next_elem == undefined && fuzzyTravers){
					return cur_elem
				} else {
					cur_elem = next_elem;
				}
			}
		}
		return cur_elem;
	}

	// build a path between 2 elements
	function buildPath (origin, destination) {
		var cur = origin,
			path = [];

		while(!cur.contains(destination)){
			cur = cur.parentElement;
			path.push('^');
		}
		while(cur){
			path.push(getContainingElemPath(cur, destination));
			cur = cur.querySelectorAll(path[path.length-1])[0]
		}
		path.pop();
		return path;
	}

	// get one level queryselector for a target child element
	function getContainingElemPath (parentElement, targetElem) {
		var elems = parentElement.childNodes
		for(var i=0;i<elems.length;i++){
			if(elems[i].contains(targetElem)){
				
				// get index of particular element
				var ind;
				//var child_elems = parentElement.querySelectorAll(':scope > '+elems[i].nodeName.toLowerCase());
				var child_elems = parentElement.children;
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

	function getFullPath(el){
		var names = [];
		while (el.parentNode){
			if (el.id){
				names.unshift('#'+el.id);
				break;
			}else{
				if (el==el.ownerDocument.documentElement) names.unshift(el.tagName);
				else{
					for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
						names.unshift(el.tagName+":nth-child("+c+")");
				}
				el=el.parentNode;
			}
		}
		return names.join(" > ");
	}

	var nonTextElems = ['SCRIPT','INPUT','TEXTAREA', 'BODY'];
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
					
					if(nonTextElems.indexOf(DOM_Node.children[i].tagName.toUpperCase()) >= 0){
						continue;
					}
					var innerNode = getBaseTextNode(DOM_Node.children[i],regex)
					if(innerNode !== false){
						return innerNode;
					}
				}
				if(!child_containsRegex && nonTextElems.indexOf(nodeTagName) < 0){
					return DOM_Node
				} else if(!child_containsRegex){
					return false
				}
			} else if(nonTextElems.indexOf(nodeTagName) < 0){
				return DOM_Node;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	window.Cyphor.dom = {
		traversePath : traversePath,
		buildPath : buildPath,
		getBaseTextNode : getBaseTextNode,
		getFullPath : getFullPath
	}
})();