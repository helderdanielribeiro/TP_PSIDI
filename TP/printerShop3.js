


//
// This is an async server that accepts POST requests with a callback and
// when finished processing, POST the reply to the callback url
//


var express = require('express');
var bodyParser = require('body-parser');
//var methodOverride = require('method-override');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


/************/
// data
/************/

const port = process.env.PORT || 3012;
const SERVER_ROOT = "http://localhost:" + port;
const unitPrice = 12;
const discountPrice1 = 10;
const discountPrice2 = 8;

//DATA STORE

var orders =  {};

// SAMPLE DATA

var now = new Date();
var yesterday = now.getDate() + 1;
var jan1st2014 = new Date(2014, 01, 01);
var may2nd2014 = new Date(2014, 05, 02);

const pShop = "Printer Shop 1";

orders['20151'] = {id: "1", costumer:"Joao", albumName:"Vacations",	price:"40", 	createdOn: now, 		updatedOn: now};
orders['20152'] = {id: "2", costumer:"Maria", albumName:"Christmas",	price:"50", 	createdOn: yesterday, 	updatedOn: now};


//
// helper functions
//

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

//Returns a the price of print service PS3
function calcPrice(numPhotos) {
	if (numPhotos <=9){
		return numPhotos*unitPrice;
	}
	else if(numPhotos >=19){
		return numPhotos*discountPrice2;
	}else{ return numPhotos*discountPrice1;}
	
	
}

//defining a budget to a certain number of photos
function buildBudget(price){
	const now = new Date();
	return {
			printerShopID:"Printer Shop 3",
			price : price, 
			createdOn : now,
			updatedOn : now,
		};
}

function buildOrder(newID, costumer, albumName, price){
	const now = new Date();
	return {
			id : newID, 
			costumer : costumer,
			albumName:albumName,
			price : price, 
			createdOn : now,
			updatedOn : now,
		};
}

const request = require('request');

//Return the budget to a specified request
function postBack(callback, message,id, server) {
	// POST message
	request({
	   uri : callback,
	   method: "POST",
	   json : message,
	   server:server
	   }, 
	   function(err, res, body){
	        if (!err) {
	        	
	          console.log(id+" Posted reply and got " + res.statusCode);          
	        }
	        else {
	          console.log(err);
	        }
	});
}

//
// handling the collection
//
// URL: /budget
//
// GET 		return all messages
// POST		create new entry, returns 201
// PUT 		not allowed
// DELETE 	not allowed
//

app.route("/budget") 
	.get(function(req, res) {
		res.json(orders);
	})
	.put(function(req, res) {
		res.status(405).send("Cannot overwrite the entire collection.");
	})
	.post(function(req, res) {
		if (req.body.callback) {
			// determine Id of new resource
			const newID = "2015" + (Object.keys(orders).length + 1);
			//Random timeout
			const timeout = getRandomInt(1000,10000);
			const finalPrice = calcPrice(req.body.numPhotos);
			var budget = buildBudget( finalPrice);
			console.log(req.body.reference+" waiting "+timeout+" miliseconds");
			// queue the request - handle it when possible
			setTimeout(function(){
			   const now = new Date();
			   //orders[newID] = buildOrder(newID, req.body.costumer, req.body.albumName, finalPrice);			

			   //POST back the result to callback
			   postBack(req.body.callback, budget);
			}, timeout);
			
			
			

			// send 202 Acepted and Location.
			res.status(202).set('Location', SERVER_ROOT + "/budget/" + newID).send();
			console.log("Â»Â»Â» Accepted POST to new resource " + SERVER_ROOT + "/budget/" + newID);
			console.log("Â»Â»Â» Will POST back to "+req.body.callback+"withe the reference "+req.body.reference);
		}
		else {
			res.status(400).send("Bad Request. Must send callback url.");
			console.log("Â»Â»Â» Bad request with no callback URL.");	
		}
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire collection.");
	});

//
// handling individual itens in the collection
//
// URL: /order/:id
//
// GET 		return specific message or 404
// POST 	update existing entry or 404
// PUT 		overwrite existing or create new given the id. 
// DELETE 	deletes the message
//

app.param('orderID', function(req, res, next, orderID){
  req.orderID = orderID;
  return next()
})

app.route("/order/:orderID") 
	.get(function(req, res) {
		var entry = orders[req.orderID];
		console.log("Â»Â» requested: " + req.orderID + " Â»Â» " + entry);
		if (entry === undefined) {
			res.status(404).send("Order " + req.orderID + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		var entry = orders[req.orderID];
		var now = new Date();
		if (entry === undefined) {
			entry = buildOrder(newID, req.body.costumer, req.body.albumName, req.body.price);
			orders[req.orderID] = entry;
			res.status(201).set('Location', SERVER_ROOT + "/order/" + req.orderID).json(entry);
		}
		else {
			entry.costumer = req.body.costumer;
			entry.updatedOn = now;
			res.json(entry);
		}
	})
	.post(function(req, res) {
		var entry = orders[req.orderID];
		if (entry === undefined) {
			res.status(404).send("Order " + req.orderID + " not found.");
		}
		else {
			entry.text = req.body.text;
			var now = new Date();
			entry.updatedOn = now;
			res.json(entry);
		}
	})
	.delete(function(req, res) {
		var entry = orders[req.orderID];
		if (entry === undefined) {
			res.status(404).send("Order " + req.orderID + " not found.");
		}
		else {
			delete orders[req.orderID];
			res.status(204).send("Order " + req.orderID + " deleted.");
		}
	});



/////////////////////////////
// STARTING ...

app.listen(port, function() {
  console.log("Listening on " + port + " tamanho do array "+Object.keys(orders).length);
});