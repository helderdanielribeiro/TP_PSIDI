var express = require('express');
var multer = require('multer'); // for multipart file upload via form
var bodyParser = require('body-parser');

var userHandling = require("./user-handler");

var app = express();

app.use(multer({ dest: './photos/'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//
// USERS resource
//

app.route("/users") 
	.get(userHandling.handleGetUsers)
	.put(userHandling.handlePutUsers)
	.post(userHandling.handlePostUsers)
	.delete(userHandling.handleDeleteUsers);

app.param('userID', function(req, res, next, userID){
  req.userID = userID;
  return next()
})

app.route("/users/:userID") 
	.get(userHandling.handleGetUser)
	.put(userHandling.handlePutUser)
	.post(userHandling.handlePostUser)
	.delete(userHandling.handleDeleteUser);

//
// Album subresource
//
app.route("/users/:userID/albums") 
	.get(userHandling.handleGetUserAlbums)
	.put(userHandling.handlePutUserAlbums)
	.post(userHandling.handlePostUserAlbums)
	.delete(userHandling.handleDeleteUserAlbums);

	
//
// PHOTOS resource
//

app.route("/photos") 
	.get(userHandling.handleGetPhotos)
	.put(userHandling.handlePutPhotos)
	.post(userHandling.handlePostPhotos)
	.delete(userHandling.handleDeletePhotos);

app.param('photoID', function(req, res, next, photoID){
  req.photoID = photoID;
  return next()
})

app.route("/photos/:photoID") 
	.get(userHandling.handleGetPhoto)
	.put(userHandling.handlePutPhoto)
	.post(userHandling.handlePostPhoto)
	.delete(userHandling.handleDeletePhoto);



var port = process.env.PORT || 3001;

app.listen(port, function() {
	console.log("BackOffice is Live\n");
  console.log("Listening on " + port);
});