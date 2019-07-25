var AWS = require('aws-sdk');
		// Initialize the Amazon Cognito credentials provider
		AWS.config.region = 'us-east-1'; // Region
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		IdentityPoolId: 'us-east-1:70c663f1-64fb-4576-a46c-ad0b1edfbe9c',});
		// Initialize the Amazon Cognito credentials provider
		//AWS.config.region = 'us-east-1'; // Region
		//AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		// Provide your Pool Id here
		//	IdentityPoolId: 'us-east-1:XXXXX',
		//});

		var lexruntime = new AWS.LexRuntime();
		var lexUserId = 'chatbot-demo' + Date.now();
		var sessionAttributes = {};
module.exports = {

	pushChat: function pushChat(req, res) {
		console.log("PUSHCHAT",req.query.request);
		var params = {
			botAlias: 'testPublish',
			botName: 'SIAProdBot',
			inputText: req.query.request,
			userId: lexUserId,
			sessionAttributes: sessionAttributes
		};
		lexruntime.postText(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				showError('Error:  ' + err.message + ' (see console for details)')
			}
			if (data) {
				// capture the sessionAttributes for the next cycle
			sessionAttributes = data.sessionAttributes;
				// show response and/or error/dialog status
			//testRUFO	showResponse(data);
				console.log("AMAZONLEX",data);
				return res.send(data);
			}
		});
		return false;
	}
};
/*module.exports = {
pushChat: function pushChat(req, res) {

			// if there is text to be sent...
			var wisdomText = req.query.request;//document.getElementById('wisdom');
			if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

				// disable input to show we're sending it
				var wisdom = wisdomText.value.trim();
				wisdomText.value = '...';
				wisdomText.locked = true;

				// send it to the Lex runtime
				var params = {
					botAlias: 'testPublish',
					botName: 'SIAProdBot',
					inputText: wisdom,
					userId: lexUserId,
					sessionAttributes: sessionAttributes
				};
				showRequest(wisdom);
				lexruntime.postText(params, function(err, data) {
					if (err) {
						console.log(err, err.stack);
						showError('Error:  ' + err.message + ' (see console for details)')
					}
					if (data) {
						// capture the sessionAttributes for the next cycle
						sessionAttributes = data.sessionAttributes;
						// show response and/or error/dialog status
						showResponse(data);
					}
					// re-enable input
					wisdomText.value = '';
					wisdomText.locked = false;
				});
			}
			// we always cancel form submission
			return false;
		},

		showRequest :function (daText) {

			var conversationDiv = document.getElementById('conversation');
			var requestPara = document.createElement("P");
			requestPara.className = 'userRequest';
			requestPara.appendChild(document.createTextNode(daText));
			conversationDiv.appendChild(requestPara);
			conversationDiv.scrollTop = conversationDiv.scrollHeight;
		},

		showError: function (daText) {

			var conversationDiv = document.getElementById('conversation');
			var errorPara = document.createElement("P");
			errorPara.className = 'lexError';
			errorPara.appendChild(document.createTextNode(daText));
			conversationDiv.appendChild(errorPara);
			conversationDiv.scrollTop = conversationDiv.scrollHeight;
		},

		showResponse: function (lexResponse) {

			var conversationDiv = document.getElementById('conversation');
			var responsePara = document.createElement("P");
			responsePara.className = 'lexResponse';
			if (lexResponse.message) {
				responsePara.appendChild(document.createTextNode(lexResponse.message));
				responsePara.appendChild(document.createElement('br'));
			}
			if (lexResponse.dialogState === 'ReadyForFulfillment') {
				responsePara.appendChild(document.createTextNode(
					'Ready for fulfillment'));
				// TODO:  show slot values
			} else {
				responsePara.appendChild(document.createTextNode(
					'(' + lexResponse.dialogState + ')'));
			}
			conversationDiv.appendChild(responsePara);
			conversationDiv.scrollTop = conversationDiv.scrollHeight;
		}
};*/