// MessageClient.js

function MessageClient(transportLayerFunctions) {

	var _self = this;

	this.propagateUp = function () {};
	this.transportLayer = {
		up : (transportLayerFunctions && transportLayerFunctions.up) || function (){},
		down : (transportLayerFunctions && transportLayerFunctions.down) || function (){},
		buildDownFunction : (transportLayerFunctions && transportLayerFunctions.down) || function (){}
	};

	this.rooms = {};

	this.rooms = {
		_DOWNSTREAM_SUB : this.room('_DOWNSTREAM_SUB').on('join', function (msg) {
			// Some room that is down stream has propagated up this message requesting that rooms get forwarded downstream to it

			var builtDownStreamFunction = _self.transportLayer.buildDownFunction(msg);
			// listen for whatever room the downstream client is listening to and just pass it along
			_self.room(msg._origin.room).on('*', builtDownStreamFunction || _self.transportLayer.down);
		})
		.on('leave', function (msg) {
			// Some room that is down stream has propagated up this message requesting that rooms get forwarded downstream to it

			var builtDownStreamFunction = _self.transportLayer.buildDownFunction(msg);
			// listen for whatever room the downstream client is listening to and just pass it along
			_self.room(msg._origin.room).on('*', builtDownStreamFunction || _self.transportLayer.down);
		})
	};
}

MessageClient.prototype.addTransportLayer = function (transportLayerFunctions) {
	this.transportLayer.up = transportLayerFunctions.up || this.transportLayer.up || function (){};
	this.transportLayer.down = transportLayerFunctions.down || this.transportLayer.down || function (){};
};

MessageClient.prototype.propagateDown = function (messageObject) {
	var roomName = (messageObject._destination && messageObject._destination.room);
	if (this.rooms[roomName]) {
		this.rooms[roomName].digestMessage(messageObject);
	}
};

MessageClient.prototype.room = function (roomName, arrUpStreamBubbleTo) {
	var _this = this;
	(arrUpStreamBubbleTo || []).forEach(function (bubbleToName) {
		_this.processMessage({
			_destination : {
				room : '_DOWNSTREAM_SUB',
				bubbleTo : bubbleToName,
				event : 'join'
			},
			_origin : {
				room : roomName
			},
			event : 'join'
		});
	});

	if(this.rooms[roomName]){
		return this.rooms[roomName];
	} else {
		this.rooms[roomName] = new Room(this, roomName);
		return this.rooms[roomName];
	}
};

MessageClient.prototype.leaveRoom = function (roomName) {
	if(this.rooms[roomName]) {
		this.rooms[roomName].remove(true);
		delete this.rooms[roomName];
	}
};

MessageClient.prototype.request = function (roomName, messageObject, cb) {
	var _this = this;
	var requestID = ('' + Date.now() + Math.random()).replace('.','');
	this.room(requestID).on('*', cb).on('*', function () {
		_this.leaveRoom(requestID);
	});
	this.send(roomName, messageObject);
};

MessageClient.prototype.send = function (roomName, messageObject, config) {

	var bubbleTo = (messageObject._destination && messageObject._destination.bubbleTo) || (config && config._destination && config._destination.bubbleTo) || 0;

	if(!messageObject._destination) {
		messageObject._destination = {};
	}

	messageObject._destination.room = roomName;
	messageObject._destination.bubbleTo = bubbleTo;

	this.processMessage(messageObject);
};

MessageClient.prototype.processMessage = function (messageObject) {
	if(messageObject._destination.bubbleTo === 0) {
		this.propagateDown(messageObject);
	} else if (messageObject._destination.bubbleTo > 0) {
		messageObject._destination.bubbleTo -= 1;
		this.transportLayer.up(messageObject);
	} else {
		// do nothing
	}
};

function Room(MessageClient, roomName) {
	this.roomName = roomName;
	this.MessageClient = MessageClient;
	this.listeners = {};
}

Room.prototype.digestMessage = function (messageObject) {
	var eventName = messageObject.event;
	(this.listeners[eventName] || []).concat(this.listeners['*'] || []).forEach(function (l) {
		l.call(this, messageObject);
	});
	return this;
};

Room.prototype.on = function (eventName, callback) {
	if(this.listeners[eventName]){
		this.listeners[eventName].push(callback);
	} else {
		this.listeners[eventName] = [callback];
	}
	return this;
};

Room.prototype.emit = function (eventName, messageObject, config) {
	var msg = {
		event : eventName,
		data : messageObject
	};
	this.MessageClient.send(this.roomName, msg, config);
};

Room.prototype.remove = function (eventName, removeFunc) {
	if(eventName === true) {
		this.listeners = {};
	}

	if(Array.isArray(this.listeners[eventName])){
		this.listeners[eventName].forEach(function (cb, ind) {
			if(cd == removeFunc || cb === true) {
				this.listeners[eventName].splice(ind, 1);
			}
		});
	}
	return this;
};
