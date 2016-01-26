var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);			
	var jsonPath = parts.splice(3);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	var resourceKey = "$" + req.params.cat + "$" + req.params.subcat;
	console.log(requestedPath);
	var cat = req.params.cat;
	var subcat = req.params.subcat;

	switch(req.method){
		case 'GET':					
			req.sendContentList(req, res, next);
			break;		
		case 'PUT':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var jsonData = JSON.parse(data);					
					var result = {code: 1};					
					var content = req.body.content;
					try{
						content = JSON.parse(content);
					}catch(e){
						result.message = "bad data";		
						req.sendContentList(req, res, next, result);
						return;				
					}
					var check1 = _.has(jsonData, cat);		
					var check2 = check1 ? _.has(jsonData[cat], subcat) : false;		
					if(check1 && check2){
						if(_.has(content, "question")){
							jsonData[cat][subcat].push(content);
							result.code = 0;
							result.message = "success";							
						}else{									
							result.message = "only question data allowed at this level";
						}								
					}else{
						result.message = "category or sub-category does not exist";
					}
					if(result.code == 0){
						fs.writeFile(requestedPath, JSON.stringify(jsonData), function(err){
							req.sendContentList(req, res, next, result);
						})
					}else{
						req.sendContentList(req, res, next, result);
					}
				}else{
					next();
				}
			})		
			break;	
		case 'POST':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var jsonData = JSON.parse(data);				
					var prop = req.body.name.toLowerCase();						
					var result = {code: 1};
					var check1 = _.has(jsonData, cat);
					var check2 = check1 ? _.has(jsonData[cat], subcat) && !_.has(jsonData[cat], prop) && prop != subcat : false;
					if(check1 && check2){
						jsonData[cat][prop] = jsonData[cat][subcat];
						delete jsonData[cat][subcat];
						var newResourceKey = "$" + cat + "$" + prop;
						jsonData[newResourceKey] = jsonData[resourceKey];
						delete jsonData[resourceKey];
						result.code = 0;
						result.message = "success";
					}else{
						result.message = "sub-category does not exist or duplicate name";
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
		case 'DELETE':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var jsonData = JSON.parse(data);									
					var result = {code: 1};
					var check1 = _.has(jsonData, cat);
					var check2 = check1 ? _.has(jsonData[cat], subcat) : false;
					if(check1 && check2){							
						delete jsonData[cat][subcat];
						result.code = 0;
						result.message = "success";
					}else{
						result.message = "sub-category does not exist";
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
		default:
				next();
			break;
	}	
}