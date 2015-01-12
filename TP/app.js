// load the things we need
var request = require('request');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var passportLocal = require('passport-local');

//logging : DEBUG
const morgan = require('morgan');
app.use(morgan('dev'));

// LOCALS (acessible by views)
app.locals.title='My Photo Album';
app.locals.msg='';
app.locals.reg_success=''

var backofficeUrl = "http://localhost:3001";
//var user = "Diogo";

// set the view engine to ejs
app.set('view engine', 'ejs');

// definição das opções para evitar warnings
app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());
app.use(expressSession({secret : process.env.SESSION_SECRET || 'some_secret', resave : false, saveUninitialized : false}));

// "para agarrar" a sessão
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// fazer validações de utilizador
passport.use('login',new passportLocal.Strategy(function(username, password, done) {
	//  login
	if (username !== "" && password !== "") {
		request({
				uri : backofficeUrl + "/users/" + username,
				json : {}
			},
			function(err, response, body){
				var user = body;
				if (user !== undefined) {
					app.locals.reg_success='';
					return done(null, {
						id : user.id,
						name : user.name
					});
				} else {
					app.locals.reg_success='';
					return done(null, false, {
						message : 'Dados Inválidos.'
					});
				}
		});

	} else {
		done(null, false, {
			message : 'Introduza o nome de utilizador e palavra-passe.'
		});
	}
}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	done(null, {
		id : id,
		name : id
	});
});

// GET da página login
app.get('/login', function(req, res) {
	res.render('pages/login',{ message: req.flash('error') });
});

//GET da página signup
app.get('/signup',function(req,res){
	res.render('pages/signup');
  });

//POST da pagina signup
app.post('/signup', function(req, res) {
	
		request({
			uri : backofficeUrl + "/users/" + req.body.username,
			json : {}
		},
		function(err, response, body){
			var user = body;
			if (user.id !== undefined) {
				app.locals.msg='Nome de utilizador existente';
				return res.redirect('/signup'); 
			}else {	
				request.post({
					uri : backofficeUrl + "/users",
					form : {
						name : req.body.username,
						email : req.body.email, 
						password : req.body.password
					}
				},
				function(err, response, body){
					app.locals.reg_success='Resgisto efetuado com sucesso';
					console.log(app.locals.reg_success);
					return res.redirect('/login');
				});
			}
		});
});

// Post da página login
app.post('/login', passport.authenticate('login', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }));

// GET do Logout
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

// index page 
app.get('/', function(req, res) {
	if(req.isAuthenticated()){
		res.render('pages/index', {
			user : req.user
		});
	}else{
		res.redirect('/login');
	}
});

app.get('/albums', function(req, res) {
	if(req.isAuthenticated()){
		request({
			uri : backofficeUrl + "/users/" + req.user.id + "/albums",
			json : {}
			},
		function(err, response, body){
			var albums = [];
			albums = body;
			res.render('pages/albums', {
				albums: albums,
				user : req.user
			});
		});
	}else{
		res.redirect('/login');
	}
});

app.get('/encomendas', function(req, res) {
	if(req.isAuthenticated()){
		request({
			uri : backofficeUrl + "/users/" + req.user.id + "/orders",
			json : {}
			},
		function(err, response, body){
			var encomendas = [];
			encomendas = body;
			request({
				uri : backofficeUrl + "/users/" + req.user.id + "/albums",
				json : {}
				},
			function(err, response, body){
				var albums = [];
				albums = body;
				console.log(encomendas);
				res.render('pages/encomendas', {
					encomendas: encomendas,
					albums: albums,
					user : req.user
				});
			});
		});
	}else{
		res.redirect('/login');
	}
});

app.post('/order', function(req, res) {
	if(req.isAuthenticated()){
		request.post({
			headers: {'content-type' : 'application/json'},
			uri: backofficeUrl + "/users/" + req.user.id + "/orders",
			json: req.body
         }, function(error, response, body){
            res.render('pages/encomendasconfirm', {
				user : req.user,
				order : body
			});
		});
	}else{
		res.redirect('/login');
	}
});

app.post('/order/confirm', function(req, res) {
	if(req.isAuthenticated()){
		request.put({
			headers: {'content-type' : 'application/json'},
			uri: backofficeUrl + "/users/" + req.user.id + "/orders/"+ req.body.order,
			json: req.body
         }, function(error, response, body){
            res.render('pages/index', {
				user : req.user
			});
		});
	}else{
		res.redirect('/login');
	}
});

app.get('/albumsimpressao/pdf', function(req, res) {
	if(req.isAuthenticated()){
		request({
		 uri : req.query.link,
		 headers : {'Accept' : 'application/pdf'},
		 })
		.on('error', function(err){
			  console.log(err);
			})
		.pipe(fs.createWriteStream(req.user.id + ".pdf"));
	}else{
		res.redirect('/login');
	}
});

app.listen(8080);
console.log('App is Running');