var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);			
	var jsonPath = parts.splice(2);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	var pool = path.join(requestedPath, req.params.pool);
	var resourceFolder = "_" + req.params.pool;
	var resourceKey = "$" + req.params.cat;
	console.log(requestedPath);		
	switch(req.method){
		case 'GET':			
			if(_.has(req.params, "id")){				
				var file = req.params.id;									
				var filePath = path.join(requestedPath, resourceFolder, file);				
				fs.exists(filePath, (exists) => {
					if(exists){
						res.sendFile(filePath);
					}else{
						next();
					}
				})
			}else if(_.has(req.params, "cat") && !_.has(req.params, "subcat")){				
				fs.readFile(pool, "utf8", function(err, data){	
					var jsonData = JSON.parse(data);			
					res.json(jsonData[resourceKey]);
				});
			}else{
				next();
			}
			break;
		case 'POST':			
			fs.readFile(pool, "utf8", function(err, data){
				if(!err){					
					var jsonData = JSON.parse(data);
					if(_.has(jsonData, req.params.cat))	{						
						var handler = new req.PostHandler(path.join(requestedPath, resourceFolder), "", req.files, function(response){
							if(!_.has(jsonData, resourceKey)){
								jsonData[resourceKey] = [];
							}
							_.each(response, function(uploadedItem){
								jsonData[resourceKey].push({file:uploadedItem.newname, name:uploadedItem.name});
							});
							fs.writeFile(pool, JSON.stringify(jsonData), function(err){
								if(!err){
									res.json(jsonData[resourceKey]);	
								}else{
									res.json(err);	
								}
							})							
						})		
						handler.handle();	
					}else{
						next();
					}				
				}else{
					next();
				}
			})		
			break;
		case 'DELETE':			
			fs.readFile(pool, "utf8", function(err, data){
				if(!err){					
					var jsonData = JSON.parse(data);					
					if(_.has(jsonData, resourceKey))	{						
						fs.unlink(path.join(requestedPath, resourceFolder, req.params.id), function(err){							
							jsonData[resourceKey] = _.reject(jsonData[resourceKey], function(f){
								return req.params.id == f.file;
							});
							fs.writeFile(pool, JSON.stringify(jsonData), function(err){
								if(!err){
									res.json(jsonData[resourceKey]);	
								}else{
									res.json(err);	
								}
							})
						})						
					}else{
						next();
					}				
				}else{
					next();
				}
			})		
			break;	
		default:
				next();
			break;
	}
}