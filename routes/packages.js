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

exports.base = function(req, res, next){	
	var handler = require(__dirname + "/handlers/packages_base");	
	handler.handle(req, res, next);	
}

exports.package = function(req, res, next){		
	var handler = require(__dirname + "/handlers/packages_package");	
	handler.handle(req, res, next);	
}

exports.branch = function(req, res, next){		
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_branch");	
		handler.handle(req, res, next);	
	}
}

exports.pool = function(req, res, next){	
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_pool");	
		handler.handle(req, res, next);	
	}	
}

exports.category = function(req, res, next){
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_category");	
		handler.handle(req, res, next);	
	}	
}

exports.subcategory = function(req, res, next){
	if(checkNames(req, res, next)){
		var handler = require(__dirname + "/handlers/packages_subcategory");	
		handler.handle(req, res, next);	
	}	
}

exports.content = function(req, res, next){		
	var handler = require(__dirname + "/handlers/packages_content");	
	handler.handle(req, res, next);	
}