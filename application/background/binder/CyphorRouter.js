// CyphorRouter

var CyphorRouter = new Router();

// preprocess
CyphorRouter.registerPreProcess(function (request, sender, sendResponse) {
	var routeKey = request.url

	return [routeKey, request, sender, sendResponse];
});


// users
CyphorRouter.register('/users/me', function (request, sender, sendResponse) {
	var user = CyphorDB.query({url:'/users/me'});
	if(Array.isArray(user) && user.length){
		sendResponse({
			status : 200,
			body : user[0],
			data : user[0],
			resposne : JSON.stringify(user[0])
		});
	} else {
		executeHttp(request.method, request.url, request.data || request.body, function (httpResp) {
			var responseBody = JSON.parse(httpResp.responseText);

			if(Array.isArray(responseBody)){
				responseBody.forEach(function (elem) {
					elem.url = request.url;
					CyphorDB.push(elem._id, elem, 'serverResp');
				});
			} else if(typeof(responseBody) == 'object') {
				responseBody.url = request.url;
				CyphorDB.push(responseBody._id, responseBody, 'serverResp');
			}

			sendResponse({
				status : 200,
				body : responseBody,
				data : responseBody,
				resposne : JSON.stringify(responseBody)
			});
		})
	}
});



/////////////////////// Channels ///////////////////////

CyphorRouter.register('/channels/me', function (request, sender, sendResponse) {
	var channels = CyphorDB.query({url:'/channels/me'});
	if(Array.isArray(channels) && channels.length){
		sendResponse({
			status : 200,
			body : channels,
			data : channels,
			resposne : JSON.stringify(channels)
		});
	} else {
		executeHttp(request.method, request.url, request.data || request.body, function (httpResp) {
			var responseBody = JSON.parse(httpResp.responseText);

			if(Array.isArray(responseBody)){
				responseBody.forEach(function (elem) {

					elem.url = request.url;
					CyphorDB.push(elem._id, elem, 'serverResp');
				});
			} else if(typeof(responseBody) == 'object') {
				responseBody.url = request.url;
				CyphorDB.push(responseBody._id, responseBody, 'serverResp');
			}

			sendResponse({
				status : 200,
				body : responseBody,
				data : responseBody,
				resposne : JSON.stringify(responseBody)
			});

			
		})
	}
});

// creating a channel for the first time
CyphorRouter.register(new RegExp('^/channels'), function (request, sender, sendResponse) {


	// get JSON object from request body (works for Chrome messages and Web JSON)
	var postData = request.body || request.data;
	if(typeof(postData) != 'object'){
		try{
			postData = JSON.parse(postData);
		} catch (e) {}
	}

	// route GET/POST/PUT
	switch(request.method){
		// checks if post data has an ID. If does saves locally. If doesn't POSTS it to server, sends back response data
		case 'POST' :
		case 'PUT' :

			executeHttp(request.method, request.url, request.data || request.body, function (serverResp) {
				saveServerResp(serverResp, sendResponse);
			});

			// assume channel was saved on client side when was created

			break;
	}
});

CyphorRouter.register(new RegExp('^/channels/[A-z0-9_]{20,30}'), function (request, sender, sendResponse) {


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
			var channelObjs = CyphorDB.query({
				// parses channel ID from the request URL
				_id : request.url.match(new RegExp('/?channels/([A-z0-9_]+)')[0])
			});
			sendResponse({
				status : 200,
				body : channelObjs,
				data : channelObjs,
				resposne : JSON.stringify(channelObjs)
			});
			break;

		// checks if post data has an ID. If does saves locally. If doesn't POSTS it to server, sends back response data
		case 'POST' :
		case 'PUT' :
			if(postData._id){
				CyphorDB.push(postData._id, postData, 'popout');

			} else {
				executeHttp(request.method, request.url, request.data || request.body, function (serverResp) {
					saveServerResp(serverResp, sendResponse);
				});
			}

			routeRequestToURLTab(postData.origin_url, request, function  () {
				console.log('successfully sent channel to URL tab ', arguments)
			})

			break;
	}
});



/////////////////////// Binder ///////////////////////
CyphorRouter.register(new RegExp('/binder/?.*'), function (request, sender, sendResponse) {
	console.log('background binder router. arguments : ', arguments);

	// get JSON object from request body (works for Chrome messages and Web JSON)
	var postData = request.body || request.data;
	if(typeof(postData) != 'object'){
		try{
			postData = JSON.parse(postData);
		} catch (e) {}
	}

	// route GET/POST/PUT
	switch(request.method){

		case 'PUT' :
			executeHttp(request.method, request.url, postData, function (serverResp) {
				saveServerResp(serverResp, sendResponse, serverResp);
			});
			
			// get identity of sender. Reroute information to other execution contexts
			if(sender.url.match(/chrome-extension:\/\//)){
				//@NOTE : only rerouting channels atm no need to send any other information to clients
				if(postData.origin_url && postData.channel_id){
					// reroute channel update to clients
					// can assume channel has id already (as was updated from popup window)
					routeRequestToURLTab(postData.origin_url, request, function () {
						console.log('successfully sent PUT channel to client. Response : ', arguments);
					})
				}
			}


			break;

		case 'POST' :
			var queryRes = CyphorDB.query(postData);
			if(Array.isArray(queryRes)){
				return sendResponse({
					status : 200,
					body : queryRes,
					data : queryRes,
					resposne : JSON.stringify(queryRes)
				});
			} else {
				console.warn('Expected Array output from query got :',queryRes);
			}

			//@TODO : make binder routes on server side
			executeHttp(request.method, request.url, postData, function (serverResp) {
				saveServerResp(serverResp, sendResponse);
			});

			break;
	}
});





function saveServerResp (httpResp, sendResponse) {
	var responseBody = JSON.parse(httpResp.responseText);

	if(Array.isArray(responseBody)){
		responseBody.forEach(function (elem) {

			//elem.url = httpResp.responseURL;
			CyphorDB.push(elem._id, elem, 'serverResp');
		});
	} else if(typeof(responseBody) == 'object') {
		//responseBody.url = httpResp.responseURL;
		CyphorDB.push(responseBody._id, responseBody, 'serverResp');
	}

	sendResponse({
		status : 200,
		body : responseBody,
		data : responseBody,
		resposne : JSON.stringify(responseBody)
	});	
}

function executeHttp (method, path, body, callback) {
	var x = new XMLHttpRequest();
	x.open(method,'http://www.cryptolayer.io'+path);
	x.setRequestHeader('Content-Type', 'application/json');
	x.onreadystatechange = function() {
		if (x.readyState==4){
			callback(x);
		} else if(x.readyState == 4 && x.status != 200){
			console.error('FAILED SERVER REQUEST', x);
			callback(x);
		}
	};
	if(typeof body !== 'string'){
		body = JSON.stringify(body);
	}
	x.send(body);
}

function routeRequestToURLTab (url, requestObj, callback) {

	var urlQuery = '*://'+ url + '/*'
	chrome.tabs.query({url : urlQuery}, function (tabs) {
		if(Array.isArray(tabs) && tabs.length){
			chrome.tabs.sendMessage(tabs[0].id, requestObj, (callback || function () {}));
		}
	});
}