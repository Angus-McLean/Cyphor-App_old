// CyphorRouter
var CyphorRouter = new Router();
var CyphorDB = new jsDataStore();

// preprocess
CyphorRouter.registerPreProcess(function (request, sender, sendResponse) {
	var routeKey = request.url

	return [routeKey, request, sender, sendResponse];
});

/////////////////////// Channels ///////////////////////

CyphorRouter.register(new RegExp('/?channels/[A-z0-9_]{20,30}'), function (request, sender, sendResponse) {


	// get JSON object from request body (works for Chrome messages and Web JSON)
	var postData = request.body || request.data;
	if(typeof(postData) != 'object'){
		try{
			postData = JSON.parse(postData);
		} catch (e) {}
	}

	// route GET/POST/PUT
	switch(request.method){
		case 'GET' :
			console.log('You sure you wanted to send a GET to Tab? This is the request : ', request);
			break;

		// checks if post data has an ID. If does saves locally. If doesn't POSTS it to server, sends back response data
		case 'POST' :
		case 'PUT' :
			if(postData._id){
				CyphorDB.push(postData._id, postData, 'background');
			}

			break;
	}

});