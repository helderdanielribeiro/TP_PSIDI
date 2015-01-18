///////////////////////////////////////////////////////
//
// Paulo Gandra de Sousa, Alexandre Bragança
// PSIDI / MEI / ISEP
// (c) 2014
//
///////////////////////////////////////////////////////

//
// a node module to handle the /user/ resource and the /photo/ subresource
//


const fs = require("fs");
const PDFDocument = require('pdfkit');

/************/
// data
/************/

//TODO pass these as parameters to the module
const port = process.env.PORT || 3001;
const SERVER_ROOT = "http://localhost:" + port;
const ROOT_DIR = __dirname; 

// DATA STORE

var users =  {};

var albums = {};

var photos = {};

var albumsimpressao = {};

var encomendas = {};

photos["photo1"] = "photo1.jpg";
photos["photo2"] = "photo2.jpg";
photos["photo3"] = "photo3.jpg";
photos["photo4"] = "photo4.jpg";
photos["girl"] = "girl.jpg";
photos["Tom"] = "Tom.jpg";

users['Diogo'] = {id: "Diogo", name:"Diogo", email:"diogo@pt.pt", password:"12345"};
users['Helder'] =  {id: "Helder",  name:"Helder", email:"helder@pt.pt", password:"12345"};

albums['Diogo'] = [{ name: "Album 1", Tema: "Exemple",
					photos: [{id: "photo1", description: "imagem", date: "21/12/12"}, {id: "photo2", description: "imagem", date: "21/12/12"}, {id: "photo3", description: "imagem", date: "21/12/12"}, {id: "photo4", description: "imagem", date: "21/12/12"}]
					}
				];
albums['Helder'] = [{ name: "Album Familia", Tema: "PF",
					photos: [{id: "girl", description: "imagem", date: "21/12/12"}, {id: "Tom", description: "imagem", date: "21/12/12"}]
					}
				];
				
albumsimpressao['Helder'] = [{ id:"aImp1", titulo: "Album Familia", tema: "Vida", mensagem: "Bem Vindo ao Album", photos: ["girl", "Tom"]}];

encomendas['Helder'] = [{id: "order1", morada:"Rua de São Tomé, 100 4200-485 Porto", preco: "50.0", status:"Entregue", distancia: "100", quote:"bla bla", albumimpressao: "aImp1", pdfAvailable:true}]

//users

function handleGetUsers(req, res) {
		res.status(405).send("Cannot return the entire collection.");
	};

function handlePutUsers(req, res) {
		res.status(405).send("Cannot overwrite the entire collection.");
	};

function handlePostUsers(req, res) {
	var entry = users[req.body.name];
	if (entry === undefined) {
		entry = {
			id : req.body.name,
			name : req.body.name,
			email : req.body.email, 
			password : req.body.password
		};
		users[req.body.name] = entry;
		res.status(201).set('Location', SERVER_ROOT + "/users/" + req.body.name).json(entry);
	}
	else {
		entry.name = req.body.name;
		entry.email = req.body.email, 
		entry.password = req.body.password;
		res.json(entry);
	}
};

function handleDeleteUsers(req, res) {
		res.status(405).send("Cannot delete the entire collection.");
	};
	
//photos
	
function handleGetPhotos(req, res) {
	res.status(405).send("Cannot return the entire collection.");
};

function handlePutPhotos(req, res) {
		res.status(405).send("Cannot overwrite the entire collection.");
	};

function handlePostPhotos(req, res) {
		res.status(405).send("");
	};

function handleDeletePhotos(req, res) {
		res.status(405).send("Cannot delete the entire collection.");
	};

//pdf
	
function generatePDF(res, order, user){
	var doc = new PDFDocument();
	
	// stream the content to the http response
	res.setHeader("Content-Type", "application/pdf");
	doc.pipe(res);

	var album = {};
	if(albumsimpressao[user] !== undefined){
		albumsimpressao[user].forEach(function(albumImp){
			if(albumImp.id == order.albumimpressao){
				album = albumImp;
			}
		});
	}
	
	//name
	doc.fontSize(18);
	doc.fillColor('black').text(album.titulo);
	doc.moveDown();
	doc.fontSize(12);
	doc.fillColor('black').text(album.tema);
	doc.moveDown();
	doc.fontSize(10);
	doc.fillColor('black').text(album.mensagem);
	doc.moveDown();
	
	//photos
	album.photos.forEach(function(photo) {
		doc.image(__dirname + "/photos/" + photos[photo]);
		doc.moveDown();
	});
	
	doc.fontSize(10);
	doc.fillColor('black').text(order.quote);
	doc.moveDown();

	// close document and response stream
	doc.end();
}

//ORDERS

//Returns a random integer between min (included) and max (excluded)
//Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}


// users/:userid

function handleGetUser(req, res) {
		var entry = users[req.userID];
		if (entry === undefined) {
			res.status(404).send("User " + req.userID + " not found.");		
		}
		else {
		    res.format({
		        'application/json': function(){
		            res.json(entry);
		        }
		    });
		}
	};

function handlePutUser(req, res) {
	var entry = users[req.userID];
	if (entry === undefined) {
		res.status(404).send("User " + req.userID + " not found.");
	}
	else {
		entry.name = req.body.name;
		entry.email = req.body.email, 
		entry.password = req.body.password;
		res.json(entry);
	}
	};

function handlePostUser(req, res) {
	res.status(405).send("To register a new user, please issue a POST to /users.");
	};

function handleDeleteUser(req, res) {
	res.status(405).send("Cannot delete users.");
	};

// photos/:photoid

function handleGetPhoto(req, res){
	var entry = photos[req.photoID];
	if (entry === undefined) {
		res.status(404).send("Photo " + req.photoID + " not found.");		
	}
	else {
		var options = {
			root: ROOT_DIR + '/photos/',
			dotfiles: 'deny',
			headers: {
				'x-timestamp': Date.now(),
				'x-sent': true
			}
		  };
		var fileName = photos[req.photoID];
		res.sendFile(fileName, options, function (err) {
		if (err) {
		  console.log(err);
		  res.status(err.status).end();
		}
		else {
		  console.log('Sent:', fileName);
		}
		});			  	
	}
	};

function handlePutPhoto(req, res) {
		res.status(405).send("");
	};

function handlePostPhoto(req, res) {
		res.status(405).send("");
	};

function handleDeletePhoto(req, res) {
		res.status(405).send("");
	};
	
// users/:userid/albums

function handleGetUserAlbums(req, res) {
	var entry = users[req.userID];
	if (entry === undefined) {
		res.status(404).send("User " + req.userID + " not found.");		
	}
	else {
		if (albums[req.userID] !== undefined) {
			var userAlbums = [];
			albums[req.userID].forEach(function(album) {
				var photosURI = [];
				album.photos.forEach(function(photo) {	
					var photoURI = SERVER_ROOT + "/photos/" + photo.id;
					
					photosURI.push({uri: photoURI, description: photo.description, date: photo.date});
				});
				albumOutput = {
					name: album.name,
					Tema: album.Tema,
					photos: photosURI
				};
				userAlbums.push(albumOutput);
			});
			res.json(userAlbums);
		}
		else {
		res.status(404).send("User " + req.userID + " albums not found.");		
		}
	}
	};

function handlePutUserAlbums(req, res) {
		res.status(405).send("Cannot PUT albums. Please use POST.");
	};

function handlePostUserAlbums(req, res) {
		var entry = users[req.userID];

		if (entry === undefined) {
			res.status(404).send("User " + req.userID + " not found.");
		}
		else {
			var filename = req.files.displayImage.path; // TODO check if file has been sent
			var ext = filename.substr(filename.lastIndexOf('.'));
			var photoFilename = req.userID + ext;
			var photoPath = ROOT_DIR + "/photo/" + photoFilename;

			var photoEntry = albums[req.userID];
			if (photoEntry !== undefined) {
				fs.rename(filename, photoPath, function(err){
					if (!err) {
						albums[req.userID].path = photoFilename;
						res.status(200).send("Ok");
					}
					else {
						res.status(500).send(err);	
					}
				}); 
			}
			else {
				fs.rename(filename, photoPath, function(err){
					if (!err) {
						albums[req.userID] = { path: photoFilename};
						res.status(201).send("Created");
					}
					else {
						res.status(500).send(err);	
					}
				});
			}
		}
	};

function handleDeleteUserAlbums(req, res) {
		var entry = users[req.userID];
		if (entry === undefined) {
			res.status(404).send("User " + req.userID + " not found.");
		}
		else {
			if (albums[req.userID] !== undefined) {
				delete albums[req.userID];
				res.status(200).send("Photo of User " + req.userID + " deleted.");
			}
			else {
				res.status(404).send("Photo of user  " + req.userID + " not found.");		
			}
		}
	};

function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
};
	// users/:userid/orders

function handleGetUserOrders(req, res) {
	var entry = users[req.userID];
	if (entry === undefined) {
		res.status(404).send("User " + req.userID + " not found.");		
	}
	else {
		if (encomendas[req.userID] !== undefined) {
			var orders = [];
			encomendas[req.userID].forEach(function(order) {
				var albImp = {};
				if(albumsimpressao[req.userID] !== undefined){
					albumsimpressao[req.userID].forEach(function(album){
						if(album.id == order.albumimpressao){
							albImp = album;
						}
					});
				}
				if(order.pdfAvailable){
					orderObj = {
						name: albImp.titulo,
						status: order.status,
						preco: order.preco,
						morada: order.morada,
						quote: order.quote,
						pdf: SERVER_ROOT + "/users/"+req.userID+"/albumsimpressao/" + order.albumimpressao
					}
				}else{
					orderObj = {
						name: albImp.titulo,
						status: order.status,
						preco: order.preco,
						morada: order.morada,
						quote: order.quote
					}
				}
				orders.push(orderObj);
			});
			res.json(orders);
		}else {
		res.status(404).send("User " + req.userID + " as no orders");		
		}
	}
	};

function handlePutUserOrders(req, res) {
		res.status(405).send("Cannot PUT albums. Please use POST.");
	};

function handlePostUserOrders(req, res) {
		var entry = users[req.userID];
		if (entry === undefined) {
			res.status(404).send("User " + req.userID + " not found.");
		}
		else {
			if(req.body !== undefined){
			var photosNumber = 0;
				var photosArray = [];
				if(Array.isArray(req.body.photos)){
					req.body.photos.forEach(function(photo){
						photosArray.push(photo.split("photos/")[0]);
						photosNumber++;
					});
				}else{
					photosArray.push(req.body.photos.split("photos/")[0]);
					photosNumber++;
				}
				var albImp = { 
					id: guid(), 
					titulo: req.body.titulo, 
					tema: req.body.tema, 
					mensagem: req.body.mensagem, 
					photos: photosArray};
					
				albumsimpressao[req.userID].push(albImp);
				
				var newOrder = {
					id: guid(), 
					morada: req.body.morada, 
					preco: photosNumber*1.05, 
					status:"Aguarda Aceitação", 
					distancia: "", 
					quote:"", 
					albumimpressao: albImp.id, 
					pdfAvailable:false
				};
				encomendas[req.userID].push(newOrder);
				
				res.status(201).set('Location', SERVER_ROOT + "/users/" + req.userID + "/orders/" + newOrder.id).json(newOrder);
			}
		}
	};

function handleDeleteUserOrders(req, res) {
		var entry = users[req.userID];
		if (entry === undefined) {
			res.status(404).send("User " + req.userID + " not found.");
		}
		else {
			if (albums[req.userID] !== undefined) {
				delete albums[req.userID];
				res.status(200).send("Photo of User " + req.userID + " deleted.");
			}
			else {
				res.status(404).send("Photo of user  " + req.userID + " not found.");		
			}
		}
	};
	
function handleGetUserOrder(req, res){
	res.status(405).send("");
	};

function handlePutUserOrder(req, res) {
		var entry = encomendas[req.userID];
		if (entry === undefined) {
			res.status(404).send("User " + req.userID + " not found.");
		}
		else {
			encomendas[req.userID].forEach(function(order){
				if(order.id == req.body.order){
					if(req.body.resposta == "Confirmar"){
						order.status = "Aceite";
						res.status(200).json(order);
					}
				}
			});
		}
	};

function handlePostUserOrder(req, res) {
		res.status(405).send("");
	};

function handleDeleteUserOrder(req, res) {
		res.status(405).send("");
	};
	
	
function handleGetAlbumImpressao(req, res){
	var entry = {};
	if(albumsimpressao[req.userID] !== undefined){
		albumsimpressao[req.userID].forEach(function(album){
			if(album.id == req.albumimpressaoID){
				entry = album;
			}
		});
	}
	if (entry === undefined) {
		res.status(404).send("Album de Impressao " + req.albumimpressaoID + " not found.");		
	}
	else {
		var encomenda = {};
		if(encomendas[req.userID] !== undefined){
			encomendas[req.userID].forEach(function(order){
				if(order.albumimpressao == req.albumimpressaoID){
					encomenda = order;
			}});
		}
		res.format({
						'application/json': function(){
							res.json(entry);
						},
						'application/pdf': function(){
							generatePDF(res, encomenda, req.userID);
						},
						'default': function() {
							// log the request and respond with 406
							res.status(406).send('Not Acceptable');
						}
					});		  	
	}
	};

function handlePutAlbumImpressao(req, res) {
		res.status(405).send("");
	};

function handlePostAlbumImpressao(req, res) {
		res.status(405).send("");
	};

function handleDeleteAlbumImpressao(req, res) {
		res.status(405).send("");
	};
	
//albumsimpressao
	
function handleGetAlbumsImpressao(req, res) {
	res.status(405).send("Cannot return the entire collection.");
};

function handlePutAlbumsImpressao(req, res) {
		res.status(405).send("Cannot overwrite the entire collection.");
	};

function handlePostAlbumsImpressao(req, res) {
		res.status(405).send("");
	};

function handleDeleteAlbumsImpressao(req, res) {
		res.status(405).send("Cannot delete the entire collection.");
	};
	
/////////////////////////////
// MODULE EXPORTS

exports.handleGetUsers = handleGetUsers;
exports.handlePutUsers = handlePutUsers;
exports.handlePostUsers = handlePostUsers;
exports.handleDeleteUsers = handleDeleteUsers;

exports.handleGetUser = handleGetUser;
exports.handlePostUser = handlePostUser;
exports.handlePutUser = handlePutUser;
exports.handleDeleteUser = handleDeleteUser;

exports.handleGetUserAlbums = handleGetUserAlbums;
exports.handlePostUserAlbums = handlePostUserAlbums;
exports.handlePutUserAlbums = handlePutUserAlbums;
exports.handleDeleteUserAlbums = handleDeleteUserAlbums;

exports.handleGetUserOrders = handleGetUserOrders;
exports.handlePostUserOrders = handlePostUserOrders;
exports.handlePutUserOrders = handlePutUserOrders;
exports.handleDeleteUserOrders = handleDeleteUserOrders;

exports.handleGetUserOrder = handleGetUserOrder;
exports.handlePutUserOrder = handlePutUserOrder;
exports.handlePostUserOrder = handlePostUserOrder;
exports.handleDeleteUserOrder = handleDeleteUserOrder;

exports.handleGetAlbumsImpressao = handleGetAlbumsImpressao;
exports.handlePutAlbumsImpressao = handlePutAlbumsImpressao;
exports.handlePostAlbumsImpressao = handlePostAlbumsImpressao;
exports.handleDeleteAlbumsImpressao = handleDeleteAlbumsImpressao;

exports.handleGetAlbumImpressao = handleGetAlbumImpressao;
exports.handlePostAlbumImpressao = handlePostAlbumImpressao;
exports.handlePutAlbumImpressao = handlePutAlbumImpressao;
exports.handleDeleteAlbumImpressao = handleDeleteAlbumImpressao;

exports.handleGetPhotos = handleGetPhotos;
exports.handlePostPhotos = handlePostPhotos;
exports.handlePutPhotos = handlePutPhotos;
exports.handleDeletePhotos = handleDeletePhotos;

exports.handleGetPhoto = handleGetPhoto;
exports.handlePostPhoto = handlePostPhoto;
exports.handlePutPhoto = handlePutPhoto;
exports.handleDeletePhoto = handleDeletePhoto;
