// simple router

function Router () {
	this.routes = [];
	this.preprocessors = [];
}

Router.prototype.register = function(routeKey, handlerFunction) {
	if(typeof(routeKey) != 'string' && !(routeKey instanceof RegExp)){
		throw 'the route key needs to be of type string or RegExp';
	}

	this.routes.push({
		routeKey : routeKey,
		handler : handlerFunction
	});
};

// pass routeKey as first parameter
Router.prototype.handle = function() {
	var passedAddress = arguments[0];
	var passArgs = Array.prototype.splice.call(arguments, 1);
	for(var i in this.routes){
		if(this.routes[i].routeKey instanceof RegExp){
			if(new RegExp(this.routes[i].routeKey).test(passedAddress)){
				// passes all parameters to handler
				this.routes[i].handler.apply(null, passArgs);
			}
		} else {
			if(passedAddress.indexOf(this.routes[i].routeKey) == 0){
				this.routes[i].handler.apply(null, passArgs);
			}
		}
	}
};

Router.prototype.registerPreProcess = function(procFunction) {
	this.preprocessors.push(procFunction);
};


Router.prototype.listen = function() {
	// preprocess the arguments //
	var args = arguments;
	this.preprocessors.forEach(function (procFunction) {
		args = procFunction.apply(null, args);
	});

	this.handle.apply(this, args);
};