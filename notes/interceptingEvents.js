// intercept an object (not fully complete I don't think)
KeyboardEvent = (function () {
	var orig = KeyboardEvent;

	return function () {
		console.log('new KeyboardEvent');
		var real = new (Function.prototype.bind.apply(orig, arguments));
		var obj = Object.create(orig.prototype);

		console.log('new KeyboardEvent', real, obj);
		// add whatever properties you want to object here..

		return obj;
	};
})()

// CloneObject
function CloneObject(orig) {
	var obj = Object.create(Object.getPrototypeOf(orig));

	for(var i in orig){
		(function (j){
			Object.defineProperty(obj, j, {
				get : function () {
					return (typeof orig[j] == 'function') ? orig[j].bind(orig) : orig[j];
				},
				set : function (v) {
					return orig[j] = v;
				},
				enumerable : orig.propertyIsEnumerable(j)
			});
		})(i);
	}
	return obj;
}

Element.prototype.addEventListener = (function () {
	var orig = Element.prototype.addEventListener;
	return function(){
		func = arguments[1]
		arguments[1] = (function (eve) {
			var cloned = CloneObject(eve);
			console.log(cloned);
			return func.call(this, cloned);
		})
		return orig.apply(this, arguments);
	}
})();
