var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	console.log(requestedPath);
	switch(req.method){
		case 'GET':				
			req.sendPoolList(req, res, next);
			break;	
		case 'PUT':
			var pool = req.body.name.toLowerCase();			
			var pth = path.join(requestedPath, pool);
			var resPath = path.join(requestedPath, '_' + pool);
			if(pool){
				fs.writeFile(pth, "{}", function(err){					
					fs.mkdir(resPath, function(err){
						req.sendPoolList(req, res, next, err ? req.getError(err, "unable to create pool") : req.getSuccess());
					})							
				});
			}else{
				req.sendPoolList(req, res, next);
			}
			break;
		case 'POST':
			var name = req.body.name.toLowerCase();
			if(name){
				parts.pop();
				var newPath = path.join(req.packageFolder, parts.join(path.sep), name);
				var mv = require("mv");
				mv(requestedPath, newPath, {mkdirp: true}, function(err){
					req.sendBranchList(req, res, next, err ? req.getError(err, "unable to rename branch") : req.getSuccess());
				});
			}else{
				req.sendBranchList(req, res, next);
			}
			break;
		case 'DELETE':			
			var fsExtra = require("fs.extra");
			fsExtra.rmrf(requestedPath, function(err){
				req.sendBranchList(req, res, next, err ? req.getError(err, "unable to delete branch") : req.getSuccess());
			});
			break;
		default:
				next();
			break;
	}
}