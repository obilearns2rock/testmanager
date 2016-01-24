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
					console.log(jsonData);
					console.log(req.params);
					if(_.has(jsonData, req.params.cat))	{
						var result = {};
						var questn = _.find(jsonData[req.params.cat], function(i){
							return _.has(i, "question");
						});
						console.log(questn);
						result.type = questn ? "content" : "sub-categories";
						result.data = questn ? jsonData[req.params.cat] : _.keys(jsonData[req.params.cat]);
						res.json(result);
					}				
				}else{
					next();
				}
			})
			break;	
		case 'PUT':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var jsonData = JSON.parse(data);
					console.log(jsonData);
					var result = {status: 0};
					var cat = req.params.cat;
					var subcat = req.body.name.toLowerCase();
					var check1 = _.has(jsonData, cat);						
					if(check1 && !_.has(jsonData[cat], subcat)){
						jsonData[cat][subcat] = [];
						result.status = 1;
						result.message = "success";
					}else if(!check1){
						result.message = "category does not exist";
					}else{
						result.message = "sub-category exists already";
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
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var jsonData = JSON.parse(data);
					var cat = req.params.cat;
					var prop = req.body.name.toLowerCase();	
					console.log(jsonData);
					var result = {status: 0};
					if(_.has(jsonData, cat)){
						jsonData[prop] = jsonData[cat];
						delete jsonData[cat];
						result.status = 1;
						result.message = "success";
					}else{
						result.message = "category does not exist";
					}
					if(result.status == 1){
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
						res.json(result);
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
					var cat = req.params.cat;					
					var result = {status: 0};
					if(_.has(jsonData, cat)){							
						delete jsonData[cat];
						result.status = 1;
						result.message = "success";
					}else{
						result.message = "category does not exist";
					}
					if(result.status == 1){
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
						res.json(result);
					}
				}else{
					next();
				}
			})
			break;
	}	
}