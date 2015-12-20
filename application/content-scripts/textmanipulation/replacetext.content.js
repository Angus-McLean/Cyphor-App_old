// replacetext.content.js
console.log('loaded replacetext.content.js');


function replaceSelectedText(replacementText) {

	var sel, range;
	if (window.getSelection) {
		sel = window.getSelection();
		if (sel.rangeCount) {
			var childrenInputNodes;
			if(sel.anchorNode && sel.anchorNode.getElementsByTagName){
				childrenInputNodes = sel.anchorNode.querySelectorAll('input,textarea');
			}

			if(childrenInputNodes && childrenInputNodes.length > 0){
				var selectedText = sel.toString()
				for(var i=0;i<childrenInputNodes.length;i++){
					if(selectedText == childrenInputNodes[i].value){
						childrenInputNodes[i].value = replacementText;    
					}
				}
			} else {
				range = sel.getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode(replacementText));
			}
		}
	} else if (document.selection && document.selection.createRange) {
		range = document.selection.createRange();
		range.text = replacementText;
	}
}