var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	console.log(requestedPath);
	switch(req.method){
		case 'GET':				
			req.sendBranchList(req, res, next);
			break;
		case 'PUT':
			var branch = req.body.name.toLowerCase();
			var pth = path.join(req.packageFolder, parts.join(path.sep), branch);
			if(branch){
				fs.mkdir(pth, function(err){
					req.sendBranchList(req, res, next, err ? req.getError(err, "unable to create branch") : req.getSuccess());
				});
			}else{
				req.sendBranchList(req, res, next);
			}
			break;	
		case 'POST':
			var name = req.body.name.toLowerCase();
			if(name){
				parts.pop();
				var newPath = path.join(req.packageFolder, parts.join(path.sep), name);
				var mv = require("mv");
				mv(requestedPath, newPath, {mkdirp: true}, function(err){
					req.sendPackageList(req, res, next, err ? req.getError(err, "unable to rename package") : req.getSuccess());
				});
			}else{
				req.sendPackageList(req, res, next);
			}
			break;
		case 'DELETE':			
			var fsExtra = require("fs.extra");
			fsExtra.rmrf(requestedPath, function(err){				
				req.sendPackageList(req, res, next, err ? req.getError(err, "unable to delete package") : req.getSuccess());
			});
			break;
		default:
				next();
			break;
	}
}