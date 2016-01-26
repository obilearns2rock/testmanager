var fs = require("fs");
var path = require("path");
var _ = require("underscore");

var checkNames = function(req, res, next){		
	if(req.method == 'POST' || req.method == 'PUT'){
		var name = req.body.name.toLowerCase();
		if(name.indexOf('$') > -1){
			var result = { status: 0}	
			result.message = "$ sign not allowed";
			res.json(result);
			return false;
		}
	}
	return true;
}

var sendPackageList = function(req, res, next, status){
	fs.readdir(req.packageFolder, function(err, files){
		if(!err){
			var result = {
				status: status,
				type: "packages",
				data: files
			};					
			res.json(result);
		}else{
			res.json(err);
		}
	})
}

var sendBranchList = function(req, res, next, status){
	fs.readdir(path.join(req.packageFolder, req.params.package), function(err, files){
		if(!err){
			var result = {
				status: status,
				type: "packages",
				data: files
			};					
			res.json(result);
		}else{
			res.json(err);
		}
	})
}

var sendPoolList = function(req, res, next, status){
	fs.readdir(path.join(req.packageFolder, req.params.package, req.params.branch), function(err, files){
		if(!err){					
			var result = {
				status: status,
				type: "pools",
				data: _.reject(files, function(file){
					return file.startsWith('_');
				})
			};					
			res.json(result);
		}else{
			res.json(err);
		}
	})
}

var sendCategoryList = function(req, res, next, status){
	fs.readFile(path.join(req.packageFolder, req.params.package, req.params.branch, req.params.pool), "utf8", function(err, data){
		if(!err){					
			var jsonData = JSON.parse(data);
			var result = {
				status: status,
				type: "categories",
				data: _.reject(_.keys(jsonData), function(key){
					return key.startsWith("$");
				})
			};	
			res.json(result);					
		}else{
			res.json(err);
		}
	})
}

var sendSubCategoryList = function(req, res, next, status){
	fs.readFile(path.join(req.packageFolder, req.params.package, req.params.branch, req.params.pool), "utf8", function(err, data){
		if(!err){					
			var jsonData = JSON.parse(data);
			console.log(jsonData);			
			if(_.has(jsonData, req.params.cat))	{
				var result = {
					status: status
				};
				var questn = _.find(jsonData[req.params.cat], function(i){
					return _.has(i, "question");
				});
				console.log(questn);
				result.type = questn ? "content" : "sub-categories";
				result.data = questn ? jsonData[req.params.cat] : _.keys(jsonData[req.params.cat]);
				res.json(result);
			}else{
				next();
			}			
		}else{
			res.json(err);
		}
	})
}

var sendContentList = function(req, res, next, status){
	fs.readFile(path.join(req.packageFolder, req.params.package, req.params.branch, req.params.pool), "utf8", function(err, data){
		if(!err){					
			var jsonData = JSON.parse(data);					
			if(_.has(jsonData, req.params.cat) && _.has(jsonData[req.params.cat], req.params.subcat)){
				var result = {	
					status: status,	
					type: "content-list",					
					data: jsonData[req.params.cat][req.params.subcat]
				};						
				res.json(result);
			}else{
				next();
			}					
		}else{
			res.json(err);
		}
	})
}

var sendContent = function(req, res, next, status){
	fs.readFile(path.join(req.packageFolder, req.params.package, req.params.branch, req.params.pool), "utf8", function(err, data){
		if(!err){					
			var jsonData = JSON.parse(data);					
			if(_.has(jsonData, req.params.cat) && _.has(jsonData[req.params.cat], req.params.subcat) && jsonData[req.params.cat][req.params.subcat][req.params.id] != null){
				var result = {	
					status: status,	
					type: "content",					
					data: jsonData[req.params.cat][req.params.subcat][req.params.id]
				};						
				res.json(result);												
			}else{				
				next();
			}						
		}else{
			res.json(err);
		}
	})
}

var populateRequest = function(req){
	req.sendPackageList = sendPackageList;
	req.sendBranchList = sendBranchList;
	req.sendPoolList = sendPoolList;
	req.sendCategoryList = sendCategoryList;
	req.sendSubCategoryList = sendSubCategoryList;
	req.sendContentList = sendContentList;
	req.sendContent = sendContent;
}

exports.base = function(req, res, next){	
	var handler = require(__dirname + "/handlers/packages_base");
	populateRequest(req);
	handler.handle(req, res, next);	
}

exports.package = function(req, res, next){		
	var handler = require(__dirname + "/handlers/packages_package");	
	populateRequest(req);
	handler.handle(req, res, next);	
}

exports.branch = function(req, res, next){		
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_branch");	
		populateRequest(req);
		handler.handle(req, res, next);	
	}
}

exports.pool = function(req, res, next){	
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_pool");	
		populateRequest(req);
		handler.handle(req, res, next);	
	}	
}

exports.category = function(req, res, next){
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_category");	
		populateRequest(req);
		handler.handle(req, res, next);	
	}	
}

exports.subcategory = function(req, res, next){
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_subcategory");	
		populateRequest(req);
		handler.handle(req, res, next);	
	}	
}

exports.content = function(req, res, next){		
	var handler = require(__dirname + "/handlers/packages_content");	
	populateRequest(req);
	handler.handle(req, res, next);	
}