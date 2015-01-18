///////////////////////////////////////////////////////
//
// Paulo Gandra de Sousa, Alexandre BraganÃ§a
// PSIDI / MEI / ISEP
// (c) 2014
//
///////////////////////////////////////////////////////

//
// this examples POSTs a request and waits for the response in a calback endpoint
// there is no correlation between messages
//

//Returns a random integer between min (included) and max (excluded)
//Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// clients needs to be able to receive requests
var express = require('express');
var bodyParser = require('body-parser');
// var methodOverride = require('method-override');

var callbackApp = express();

callbackApp.locals.price='';

callbackApp.use(bodyParser.json());
callbackApp.use(bodyParser.urlencoded({
	extended : true
}));

const
callbackPort = process.env.PORT || 3005;
const
CALLBACK_ROOT = "http://localhost:" + callbackPort;

// callback routing
callbackApp.route("/callback").post(function(req, res) {
	// reply back
	res.status(204).send("No Content");

	// process the response to our initial request
	console.log("From "+req.body.printerShopID+" the price is : " + req.body.price);
});

// STARTING callback
callbackApp.listen(callbackPort, function() {
	console.log("Listening on " + callbackPort);
});

//
// CLIENT
//
const request = require('request');
const serverUrl1 = process.argv[2] || "http://localhost:3010";
const serverUrl2 = process.argv[2] || "http://localhost:3011";
const serverUrl3 = process.argv[2] || "http://localhost:3012";

const
requestNumber = 12;

if ( requestNumber !== 0){
	// POST message
	//PShop1
	request({
		uri : serverUrl1 + "/budget",
		method : "POST",
		json : {
			costumer : "Ze Manel",
			albumName : "Test Album",
			numPhotos:requestNumber,
			reference : "Process "+requestNumber,
			callback : CALLBACK_ROOT + "/callback"
		},
	}, function(err, res, body) {
		if (!err) {
			console.log("Process PShop 1"+requestNumber+" Posted request and got " + res.statusCode );
		} else {
			console.log(err);
		}
	});
	
	//PShop2
	request({
		uri : serverUrl2 + "/budget",
		method : "POST",
		json : {
			costumer : "Ze Manel",
			albumName : "Test Album",
			numPhotos:requestNumber,
			reference : "Process "+requestNumber,
			callback : CALLBACK_ROOT + "/callback"
		},
	}, function(err, res, body) {
		if (!err) {
			console.log("Process PShop 2"+requestNumber+" Posted request and got " + res.statusCode );
		} else {
			console.log(err);
		}
	});
	
	//PShop3
	request({
		uri : serverUrl3 + "/budget",
		method : "POST",
		json : {
			costumer : "Ze Manel",
			albumName : "Test Album",
			numPhotos:requestNumber,
			reference : "Process "+requestNumber,
			callback : CALLBACK_ROOT + "/callback"
		},
	}, function(err, res, body) {
		if (!err) {
			console.log("Process PShop 3"+requestNumber+" Posted request and got " + res.statusCode );
		} else {
			console.log(err);
		}
	});
}
