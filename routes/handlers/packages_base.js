var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	switch(req.method){
		case 'GET':
			req.sendPackageList(req, res, next);
			break;		
		case 'PUT':
			var pkg = req.body.name.toLowerCase();
			var pth = path.join(req.packageFolder, pkg);
			fs.mkdir(pth, function(err){
				req.sendPackageList(req, res, next);
			});
			break;
		default:
				next();
			break;
	}
}