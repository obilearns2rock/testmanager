var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);			
	var jsonPath = parts.splice(3);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	var resourceKey = "$" + req.params.cat;
	console.log(requestedPath);
	switch(req.method){
		case 'GET':					
			req.sendSubCategoryList(req, res, next);
			break;	
		case 'PUT':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var result = {code: 1};
					var jsonData = JSON.parse(data);									
					var cat = req.params.cat;
					var subcat = req.body.name.toLowerCase();
					var check1 = _.has(jsonData, cat);						
					if(check1 && !_.has(jsonData[cat], subcat)){
						jsonData[cat][subcat] = [];			
						result.code = 0;
						result.message = "success";			
					}else{
						result.message = "category does not exist or sub category duplicate";
					}
					if(result.code == 0){
						fs.writeFile(requestedPath, JSON.stringify(jsonData), function(err){
							req.sendSubCategoryList(req, res, next, result);
						})
					}else{
						req.sendSubCategoryList(req, res, next, result);
					}
				}else{
					next();
				}
			})		
			break;	
		case 'POST':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var result = {code: 1};
					var jsonData = JSON.parse(data);
					var cat = req.params.cat;
					var prop = req.body.name.toLowerCase();											
					if(_.has(jsonData, cat) && !_.has(jsonData, prop) && prop != cat){
						jsonData[prop] = jsonData[cat];
						delete jsonData[cat];
						var newResourceKey = "$" + prop;
						jsonData[newResourceKey] = jsonData[resourceKey];
						delete jsonData[resourceKey];		
						result.code = 0;
						result.message = "success";				
					}else{
						result.message = "category does not exist or category duplicate";
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
		case 'DELETE':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var result = {code: 1};
					var jsonData = JSON.parse(data);
					var cat = req.params.cat;					
					if(_.has(jsonData, cat)){							
						delete jsonData[cat];	
						result.code = 0;
						result.message = "success";					
					}else{
						result.message = "category does not exist";
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
		default:
				next();
			break;
	}	
}