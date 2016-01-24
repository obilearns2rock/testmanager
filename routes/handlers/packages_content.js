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
	var index = req.params.index;

	switch(req.method){
		case 'GET':					
			fs.readFile(requestedPath, "utf8", function(err, data){
				if(!err){					
					var jsonData = JSON.parse(data);					
					if(_.has(jsonData, cat) && _.has(jsonData[cat], subcat)){
						var result = {		
							type: "content",					
							data: jsonData[cat][subcat]
						};						
						res.json(result);
					}				
				}else{
					next();
				}
			})
			break;		
		case 'POST':
			fs.readFile(requestedPath, function(err, data){
				if(!err){
					var result = {status: 0};
					var content = {};
					try{
						content = JSON.parse(req.body.content);
					}catch(e){
						result.message = "bad data";	
						res.json(result);					
					}
					var jsonData = JSON.parse(data);																	
					var check1 = _.has(jsonData, cat);
					var check2 = check1 ? _.has(jsonData[cat], subcat) : false;
					var check3 = check2 ? _.has(jsonData[cat][subcat], index) : false;
					if(check1 && check2 && check3 && !isNaN(index)){
						if(_.has(content, "question")){
							jsonData[cat][subcat][index] = content;
							result.status = 1;
							result.message = "success";
						}else{									
							result.message = "only question data allowed at this level";
						}								
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
					var result = {status: 0};
					var check1 = _.has(jsonData, cat);
					var check2 = check1 ? _.has(jsonData[cat], subcat) : false;				
					var check3 = check2 ? _.has(jsonData[cat][subcat], index) : false;
					if(check1 && check2 && check3 && !isNaN(index)){
						var qarray = jsonData[cat][subcat];						
						jsonData[cat][subcat].splice(index, 1);
						result.status = 1;
						result.message = "success";						
					}else{
						next();
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