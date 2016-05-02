'use strict';

const fb = require('./fb-connect.js');
const sessions = require('./sessions.js').sessions;
const parser = require('./parser.js');
const request = require('request');
const getQuotes = require('./quotes.js').getQuotes;

exports.actions = {
  say: (sessionId, context, message, cb) => {
	// Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
			if (context.intent == 'quote') {
					fb.fbGenericMessage(recipientId, context.image_url,
															context.aquote, context.author, context.image_url,
															(err, data) => {
        	if (err) {
          	console.log( 'Oops! An error occurred while forwarding the generic response to', recipientId, ':', err);
        	}
					// Let's give the wheel back to our bot
        	cb();
      	});
			} else {
      	fb.fbMessage(recipientId, message, (err, data) => {
        	if (err) {
          	console.log( 'Oops! An error occurred while forwarding the response to', recipientId, ':', err);
        	}
					// Let's give the wheel back to our bot
        	cb();
      	});
			}
    } else {
      console.log('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge: (sessionId, context, entities, message, cb) => {
		delete context.forecast
  	delete context.aquote
  	delete context.location
		delete context.author
		delete context.quote_category
		delete context.intent

		const loc = parser.firstEntityValue(entities, 'location');
    if (loc) {
      context.location = loc;
	  	console.log('MERGE Extracted location:', loc);
    }

    const intent = parser.firstEntityValue(entities, 'intent');
		if (intent) {
			context.intent = intent;
	  	console.log('MERGE Extracted intent:', intent);
		}

		const category = parser.firstEntityValue(entities, 'quote_category');
		if (category) {
			context.quote_category = category;
	   	console.log('MERGE Extracted quote_category:', category);
		}
    cb(context);
  },

  error: (sessionId, context, error) => {
    console.log(error.message);
  },

  fetchWeather: (sessionId, context, cb) => {
  		console.log("Entry fetchWeather:", JSON.stringify(context, null, 4));
		var weatherEndpoint = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + context.location + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
	request({
        url: weatherEndpoint,
        json: true
    }, function(error, response, body) {
       try {
  		  	console.log(JSON.stringify(body, null, 4));
          var condition = body.query.results.channel.item.condition;
		  		var city = body.query.results.channel.location.city;
		  		var region = body.query.results.channel.location.region;
		  		context.location = city + ',' + region;
		  		context.forecast = "Today is " + condition.temp + " and " +
		  		condition.text + " in " + context.location;
		  		cb(context);
	   } catch (err) {
					context.forecast = "Something is wrong with Yahoo Weather API";
					console.log(weatherEndpoint);
  				console.log(JSON.stringify(body, null, 4));
					cb(context);
					console.log('error caught in weather fetch:', err)
	   }
  	})
  },

  fetchQuote: (sessionId, context, cb) => {
		getQuotes(sessionId, context, cb);
	}
};
