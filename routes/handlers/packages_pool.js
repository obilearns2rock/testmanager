var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);			
	var jsonPath = parts.splice(3);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	console.log(requestedPath);
	switch(req.method){
		case 'GET':								
			fs.readFile(requestedPath, "utf8", function(err, data){
				if(!err){					
					var jsonData = JSON.parse(data);
					var result = {
						type: "categories",
						data: _.reject(_.keys(jsonData), function(key){
							return key.startsWith("$");
						})
					};	
					res.json(result);					
				}
			})
			break;
		case 'PUT':			
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var prop = req.body.name.toLowerCase();
					var jsonData = JSON.parse(data);
					console.log(jsonData);
					var result = {status: 0};
					if(!_.has(jsonData, prop)){
						jsonData[prop] = {};
						result.status = 1;
						result.message = "success";
					}else{
						result.message = "category exists already";
					}

					fs.writeFile(requestedPath, JSON.stringify(jsonData), function(err){
						if(!err){
							res.json(result);
						}else{
							result.status = 0;
							result.message = "create error";
							res.json(result);
						}
					})	
				}else{
					next();
				}
			})
			break;
		case 'POST':
			var name = req.body.name.toLowerCase();			
			fs.exists(requestedPath, function(exists){
				if(exists && name){
					parts.pop();
					var newPath = path.join(req.packageFolder, parts.join(path.sep), name);
					var resPath = path.join(req.packageFolder, parts.join(path.sep), '_' + req.params.pool);
					var newResPath = path.join(req.packageFolder, parts.join(path.sep), '_' + name);
					fs.rename(requestedPath, newPath, function(err){
						if(!err){
							fs.rename(resPath, newResPath, function(err){
								var result = { status: err ? 0 : 1};							
								result.message = err ? err : "success";
								res.json(result);
							})
						}else{
							var result = { status: 0};							
							result.message = err;
							res.json(result);
						}						
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