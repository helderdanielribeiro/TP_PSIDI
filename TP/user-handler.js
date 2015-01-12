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

//users

function handleGetUsers(req, res) {
console.log("tou no get: "+req.body.name);
		res.status(405).send("Cannot return the entire collection.");
	};

function handlePutUsers(req, res) {
		res.status(405).send("Cannot overwrite the entire collection.");
	};

function handlePostUsers(req, res) {
	console.log("Vou criar user: "+req.body.name);
	var entry = users[req.body.name];
	if (entry === undefined) {
		entry = {
			id : req.body.name,
			name : req.body.name,
			email : req.body.email, 
			password : req.body.password
		};
		users[req.body.name] = entry;
		console.log(users[req.body.name].name);
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
	
function generatePDFOfUser(res, entry, photo){
	var doc = new PDFDocument();
	
	// stream the content to the http response
	res.setHeader("Content-Type", "application/pdf");
	doc.pipe(res);

	// document already has one page so let's use it
	
	//photo
	if (photo) {
		doc.image(__dirname + "/photo/" + photo.path);
		doc.moveDown();
	}

	//name
	doc.fontSize(18);
	doc.fillColor('black').text(entry.name);
	doc.moveDown();
	
	//email
	doc.fontSize(12);
	doc.fillColor('blue').text(entry.email);
	doc.moveDown();

	// close document and response stream
	doc.end();
}

// users/:userid

function handleGetUser(req, res) {
		var entry = users[req.userID];
		console.log("»» requested: " + req.userID + " »» " + entry);
		if (entry === undefined) {
			res.status(404).send("User " + req.userID + " not found.");		
		}
		else {
		    res.format({
		        'application/json': function(){
		            res.json(entry);
		        }/*,
		        'application/pdf': function(){
		        	console.log("»» generated PDF");
		        	generatePDFOfUser(res, entry, photos[req.userID]);
		        },
		        'default': function() {
		            // log the request and respond with 406
		            res.status(406).send('Not Acceptable');
		        }*/
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
	console.log("requested albums from " + req.userID);
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
		console.log("»» POST albums: " + req.userID + " »» " + entry);

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
				console.log("»» updating existing photo");
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
				console.log("»» creating new photo");
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

exports.handleGetPhoto = handleGetPhoto;
exports.handlePostPhoto = handlePostPhoto;
exports.handlePutPhoto = handlePutPhoto;
exports.handleDeletePhoto = handleDeletePhoto;

exports.handleGetPhotos = handleGetPhotos;
exports.handlePostPhotos = handlePostPhotos;
exports.handlePutPhotos = handlePutPhotos;
exports.handleDeletePhotos = handleDeletePhotos;