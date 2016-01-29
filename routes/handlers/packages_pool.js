var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);			
	var jsonPath = parts.splice(3);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	var resourcePath = path.join(req.packageFolder, req.params.package, req.params.branch, '_' + req.params.pool);
	console.log(requestedPath);
	switch(req.method){
		case 'GET':								
			req.sendCategoryList(req, res, next);
			break;
		case 'PUT':			
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var result = {code: 1};
					var prop = req.body.name.toLowerCase();
					var jsonData = JSON.parse(data);					
					if(!_.has(jsonData, prop)){
						jsonData[prop] = {};	
						result.code = 0;
						result.message = "success";					
					}else{
						result.message = "duplicate category";
					}

					if(result.code == 0){
						fs.writeFile(requestedPath, JSON.stringify(jsonData), function(err){
							req.sendCategoryList(req, res, next, result);
						})
					}else{
						req.sendCategoryList(req, res, next, result);
					}		
				}else{
					next();
				}
			})
			break;
		case 'POST':
			var name = req.body.name.toLowerCase();			
			if(name){
				parts.pop();
				var newPath = path.join(req.packageFolder, parts.join(path.sep), name);				
				var newResPath = path.join(req.packageFolder, parts.join(path.sep), '_' + name);
				fs.rename(requestedPath, newPath, function(err){					
					fs.rename(resourcePath, newResPath, function(err){
						req.sendPoolList(req, res, next,  err ? req.getError(err, "unable to rename pool") : req.getSuccess());
					})				
				});
			}else{
				req.sendPoolList(req, res, next);
			}	
			break;
		case 'DELETE':			
			fs.unlink(requestedPath, function(err){
				var fsExtra = require("fs.extra");
				console.log(resourcePath);
				fsExtra.rmrf(resourcePath, function(err){				
					req.sendPoolList(req, res, next, err ? req.getError(err, "unable to delete pool") : req.getSuccess());
				});				
			});
			break;
		default:
				next();
			break;
	}
}