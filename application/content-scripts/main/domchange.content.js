//domchange.content.js
console.log('loaded domchange.content.js')


var observeDOM = (function(){
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
		eventListenerSupported = window.addEventListener;

	return function(obj, callback){
		if( MutationObserver ){
			// define a new observer
			var obs = new MutationObserver(function(mutations, observer){
				if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
					callback(mutations);
			});
			// have the observer observe foo for changes in children
			obs.observe( obj, { childList:true, subtree:true });
		}
		else if( eventListenerSupported ){
			obj.addEventListener('onpropertychange', callback, false);
			obj.addEventListener('DOMNodeInserted', callback, false);
			obj.addEventListener('DOMNodeRemoved', callback, false);
		}
	}
})();


function iterateMutationRecord (mutationsArr) {
	if(CryptoLayer && CryptoLayer.settings && CryptoLayer.settings.autoDecrypt){
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
}