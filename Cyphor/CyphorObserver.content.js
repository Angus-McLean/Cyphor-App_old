(function (wind) {
	
	var listeners = [];

	function processMutation (mutRec) {
		var _elemContext = this;
		
		// call listeners for "removed event"
		if(mutRec.removedNodes && mutRec.removedNodes.length){
			Array.prototype.forEach.call(mutRec.removedNodes, function (removedNode) {
				listeners.forEach(function (listener) {
					if(listener.target == removedNode ||  (removedNode.contains && removedNode.contains(listener.target))){
						listener.listener.call(listener.target, mutRec);
					}
				});
			});
		}

		// call listeners for target nodes
		if(mutRec.target){
			listeners.forEach(function (listener) {
				if(listener.target == mutRec.target ||  (mutRec.target.contains && mutRec.target.contains(listener.target))){
					listener.listener.call(listener.target, mutRec);
				}
			});
		}
	}

	var obs = new MutationObserver(function (muts) {
		muts.forEach(processMutation);
	});

	function addObserver (element, fn) {
		listeners.push({
			target : element,
			listener : fn
		});
	}

	// removes the listener function for that element
	function removeObserver (elem) {
		listeners.forEach(function (listener, ind) {
			if(listener.target == elem){
				listeners.splice(ind, 1);
			}
		});
	}

	wind.CyphorObserver = {
		observe : addObserver,
		removeObserver : removeObserver
	};

})(window);