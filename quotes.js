'use strict';

const request = require('request');

exports.getQuotes = (sessionId, context, cb) => {
	var quote_uri = "http://quotes.rest/qod.json";
	if (context.quote_category) {
		quote_uri = quote_uri + '?category=' + context.quote_category;
	}
	request({
		url: quote_uri,
		json: true
	}, function(error, response, body) {
		try {
  		  console.log(JSON.stringify(body, null, 4));
		  context.aquote = body.contents.quotes[0]['quote'];
		  context.quote_category = body.contents.quotes[0]['category'];
		  context.author = body.contents.quotes[0]['author'];
		  context.image_url = body.contents.quotes[0]['background'];
		  context.intent = 'quote';
		  console.log(context.intent, context.aquote, context.quote_category, context.author);
		  cb(context);
		} catch(err) {
			context.forecast = "Something is wrong with quote API";
			console.log(quote_uri);
  			console.log(JSON.stringify(body, null, 4));
			cb(context);
			console.log('error caught in weather fetch:', err)
		}
	});
  }

