function jsDataStore (passedDB) {
	var db = passedDB || {};
	var events = {};

	function get (_id) {
		return db[_id];
	}

	function push (_id, doc, emitChangeEvent) {
		var old = this.get(_id);
		if(JSON.stringify(old) == JSON.stringify(doc)){
			return doc;
		} else {
			db[_id] = doc;
			if(emitChangeEvent){
				setTimeout(function () {
					emit(emitChangeEvent,[_id, doc]);
				}, 0);
			}
			return doc;
		}
	}

	function on (eventName, handler) {
		if(events[eventName]){
			events[eventName].push(handler);
		} else {
			events[eventName] = [handler];
		}
	}

	function emit (eventName, passedArgs) {
		if(events[eventName]){
			events[eventName].forEach(function (handlerFunc) {
				handlerFunc.apply(null, passedArgs);
			})
		}
	}

	function queryCheck (query, storedDoc) {
		for(var i in query){
			if(query[i] != storedDoc[i]){
				return false;
			}
		}
		return true;
	}

	function query (queryObj) {
		var ids = Object.keys(db);
		var results = ids.map(function (id) {
			if(queryCheck(queryObj, db[id])){
				return db[id];
			}
		}).filter(function (elem) {
			return elem;
		})
		return results;
	}

	return {
		db : db,
		get : get,
		push : push,
		on : on,
		emit : emit,
		query : query
	};
}
