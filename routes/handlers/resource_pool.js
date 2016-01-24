var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);			
	var jsonPath = parts.splice(2);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	console.log(requestedPath);		
	var folder = "_" + req.params.pool;
	switch(req.method){
		case 'GET':			
			if(_.has(req.params, "id")){
				var file = req.params.id;	
				var filePath = path.join(requestedPath, folder, file);				
				fs.exists(filePath, (exists) => {
					if(exists){
						res.sendFile(filePath);
					}else{
						next();
					}
				})
			}else{
				//send the list of resource in this pool							
				fs.readdir(path.join(requestedPath, folder), function(err, list){
					if(!err){											
						res.json(list);
					}else{
						res.json(err);
					}
				});
			}
			break;
		case 'POST':						
			var handler = new req.PostHandler(path.join(requestedPath, folder), "", req.files, function(res){
				this.json(res);
			}.bind(res))		
			handler.handle();	
			break;
		case 'DELETE':
			fs.unlink(path.join(requestedPath, folder, req.params.id), function(err){
				if(!err){
					res.json({"status" : "success"});
				}else{
					res.json(err);
				}
			})
			break;	
	}
}