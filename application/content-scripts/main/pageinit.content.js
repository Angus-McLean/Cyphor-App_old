// pageinit.content.js
console.log('loaded pageinit.content.js');

// DOM tranverse contants
var fuzzyTravers = true

var Cyphor = {};

var CryptoLayer = {
	settings : {
		fuzzyTravers : true,
		autoDecrypt : true,
	},
	constants : {
		mesID_beginIdentifier : 'CLIdಠ',
		mesID_endIdentifier : 'ಠIdCL_',
		mesText_beginningIdentifier : '_CLMSಠ',
		mesText_endMessageIdentifier : 'ಠMSCL_',
		writePath : '/api/messages/write',
		readPath : '/api/messages/read',
		server_URL : 'http://dev.cyphor.io',
		tagsToAvoidDecoding : ['SCRIPT','INPUT','TEXTAREA']
	}
};

// channel Constants
var channels = {};
var global_target;
var global_input;
var buildChannelPath_triggered;

window.addEventListener('click', parseForChannelPath, true);			// capture click events on the way in.
window.addEventListener('keydown', handleKeyDown, true);			// capture keydown events on the way in.

observeDOM(document,iterateMutationRecord);

loadChannels();
