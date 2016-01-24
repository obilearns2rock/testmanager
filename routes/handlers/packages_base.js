var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	switch(req.method){
		case 'GET':
			fs.readdir(req.packageFolder, function(err, files){
				if(!err){
					var result = {
						type: "packages",
						data: files
					};					
					res.json(result);
				}else{
					next();
				}
			})
			break;		
		case 'PUT':
			var pkg = req.body.name.toLowerCase();
			var pth = path.join(req.packageFolder, pkg);
			fs.exists(pth, function(exists){
				if(!exists){
					fs.mkdir(pth, function(err){
						if(!err){
							var result = { status: 1};							
							result.message = "success";
							res.json(result);
						}
					});
				}else{
					var result = { status: 0}	
					result.message = "package already exists";
					res.json(result);
				}				
			})
			break;
	}
}