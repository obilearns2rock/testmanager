var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	console.log(requestedPath);
	switch(req.method){
		case 'GET':				
			fs.readdir(requestedPath, function(err, files){
				if(!err){					
					var result = {
						type: "pools",
						data: files
					};					
					res.json(result);
				}else{
					next();
				}
			})
			break;	
		case 'PUT':
			var pool = req.body.name.toLowerCase();			
			var pth = path.join(req.packageFolder, parts.join(path.sep), pool);
			var resPath = path.join(req.packageFolder, parts.join(path.sep), '_' + pool);
			fs.exists(pth, function(exists){
				if(!exists){
					fs.writeFile(pth, "{}", function(err){
						var result = { status: err ? 0 : 1};							
						result.message = err ? "failed" : "success";
						fs.mkdir(resPath, function(err){
							result = { status: err ? 0 : 1};							
							result.message = err ? "failed" : "success";
							res.json(result);
						})							
					});						
				}else{
					var result = { status: 0}	
					result.message = "pool already exists";
					res.json(result);
				}				
			})
			break;
		case 'POST':
			var name = req.body.name.toLowerCase();
			fs.exists(requestedPath, function(exists){
				if(exists && name){
					parts.pop();
					var newPath = path.join(req.packageFolder, parts.join(path.sep), name);
					fs.rename(requestedPath, newPath, function(err){
						var result = { status: err ? 0 : 1};							
						result.message = err ? err : "success";
						res.json(result);
					});
				}else{
					next();
				}			
			});
			break;
		case 'DELETE':			
			fs.exists(requestedPath, function(exists){
				if(exists){				
					fs.unlink(requestedPath, function(err){
						var result = { status: err ? 0 : 1};							
						result.message = err ? err : "success";
						res.json(result);
					});
				}else{
					next();
				}			
			});
			break;
	}
}