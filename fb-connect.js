'use strict';

const request = require('request');
const settings = require('./settings.js');

exports.fbMessage = (recipientId, msg, cb) => {
  const fbReq = request.defaults({
    uri: 'https://graph.facebook.com/me/messages',
    method: 'POST',
    json: true,
    qs: { access_token: settings.FB_PAGE_TOKEN },
    headers: { 'Content-Type': 'application/json' }
  });

  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        text: msg,
      },
    },
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

exports.fbGenericMessage = (recipientId, image_url, title, subtitle, button_url, cb ) => {
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": title,
          "subtitle": subtitle,
          "image_url": image_url,
          "buttons": [{
            "type": "web_url",
            "url": button_url,
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: settings.FB_PAGE_TOKEN },
    method: 'POST',
    json: {
      recipient: {
        id: recipientId,
      },
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    if (cb) {
      cb(error || body.error && body.error.message, body);
    }
  });
}