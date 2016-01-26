var fs = require("fs");
var path = require("path");
var _ = require("underscore");

exports.handle = function(req, res, next){
	var parts = _.values(req.params);			
	var jsonPath = parts.splice(3);
	var requestedPath = path.join(req.packageFolder, parts.join(path.sep));
	console.log(requestedPath);
	var cat = req.params.cat;
	var subcat = req.params.subcat;
	var id = req.params.id;

	switch(req.method){
		case 'GET':					
			req.sendContent(req, res, next);
			break;		
		case 'POST':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var result = {code: 1};
					var content = {};
					try{
						content = JSON.parse(req.body.content);
					}catch(e){
						result.message = "bad data";	
						req.sendContent(req, res, next, result);
						return;				
					}
					var jsonData = JSON.parse(data);																	
					var check1 = _.has(jsonData, cat);
					var check2 = check1 ? _.has(jsonData[cat], subcat) : false;
					var check3 = check2 ? _.has(jsonData[cat][subcat], id) : false;
					if(check1 && check2 && check3 && !isNaN(id)){
						if(_.has(content, "question")){
							jsonData[cat][subcat][id] = content;
							result.code = 0;
							result.message = "success";
						}else{									
							result.message = "only question data allowed at this level";
						}								
					}
					if(result.code == 0){
						fs.writeFile(requestedPath, JSON.stringify(jsonData), function(err){
							req.sendContent(req, res, next, result);
						})		
					}else{
						req.sendContent(req, res, next, result);
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
					var check3 = check2 ? _.has(jsonData[cat][subcat], id) : false;
					if(check1 && check2 && check3 && !isNaN(id)){
						var qarray = jsonData[cat][subcat];						
						jsonData[cat][subcat].splice(id, 1);
						result.code = 0;
						result.message = "success";						
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
		default:
				next();
			break;
	}	
}