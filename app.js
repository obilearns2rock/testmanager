var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var path = require("path");

var security = require("./routes/auth");
var packages = require("./routes/packages");
var resources = require("./routes/resources");
var multer  = require('multer');

var app = express();

// add cors header
app.use(function(req, res, next) {
  	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	// res.setHeader('content-type', 'application/json');  	
  	next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.all('*', security.auth);

//Global Data
var packageFolder = path.join(__dirname, 'content');
app.use(function(req, res, next){
	req.packageFolder = packageFolder;
	next();
});

/**
*Packages end point
*/

app.all('/packages', packages.base);
app.all('/packages/:package', packages.package);
app.all('/packages/:package/:branch', packages.branch);
app.all('/packages/:package/:branch/:pool', packages.pool);
app.all('/packages/:package/:branch/:pool/:cat', packages.category);
app.all('/packages/:package/:branch/:pool/:cat/:subcat', packages.subcategory);
app.all('/packages/:package/:branch/:pool/:cat/:subcat/:index', packages.content);

/**
*Resource end point
*/

var upload = multer({ dest: 'uploads/' });
app.get('/resources/:package/:branch/:pool', resources.pool); //return list of resources
app.get('/resources/:package/:branch/:pool/:id', resources.pool); //return one single resource
app.delete('/resources/:package/:branch/:pool/:id', resources.pool); //delete one single resource

app.get('/resources/:package/:branch/:pool/:cat', resources.category);
app.post('/resources/:package/:branch/:pool/:cat', upload.array('file', 5), resources.category);
app.get('/resources/:package/:branch/:pool/:cat/:id', resources.category);
app.delete('/resources/:package/:branch/:pool/:cat/:id', resources.category);

app.get('/resources/:package/:branch/:pool/:cat/:subcat', resources.subcategory);
app.post('/resources/:package/:branch/:pool/:cat/:subcat', upload.array('file', 5), resources.subcategory);
app.get('/resources/:package/:branch/:pool/:cat/:subcat/:id', resources.subcategory);
app.delete('/resources/:package/:branch/:pool/:cat/:subcat/:id', resources.subcategory);

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		var error = {
			message: err.message,
			error: err
		};
		res.end(JSON.stringify(error));
	});
}

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	var error = {
		message: err.message,
		error: err
	};
	res.end(JSON.stringify(error));
});

app.listen(3000, function(){
	console.log("running @ port " + 3000);
});