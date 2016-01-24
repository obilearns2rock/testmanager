var fs = require("fs");
var path = require("path");

function PostHandler(destPath, prefix, files, callback){	
	this.destPath = destPath;
	this.prefix = prefix;
	this.files = files;
	this.result = [];
	this.callback = callback;

	this.handle = function(){		
		if(this.files.length > 0){
			this.currentFile = this.files.shift();
			fs.readdir(destPath, function(err, files){				
				var newCount = files.length + 1;
				var date = new Date();
				var tag = date.getFullYear().toString() + date.getMonth().toString() + date.getDate().toString() + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString() + date.getMilliseconds().toString();
				var nameParts = this.currentFile.originalname.split('.');
				var extension = nameParts.length == 2 ? nameParts[1].trim() : '';
				this.newname = this.prefix + tag + newCount + "." + extension;
				this.newPath = path.join(this.destPath, this.newname);
				fs.rename(this.currentFile.path, this.newPath, function(err){
					if(!err)
						this.result.push({name:this.currentFile.originalname, newpath:this.newPath, newname:this.newname});					
					this.handle();
				}.bind(this));
			}.bind(this))
		}else{
			this.callback(this.result);
		}
	}
}

exports.pool = function(req, res, next){	
	var handler = require(__dirname + "/handlers/resource_pool");	
	req.PostHandler = PostHandler;
	handler.handle(req, res, next);
}

exports.category = function(req, res, next){	
	var handler = require(__dirname + "/handlers/resource_category");	
	req.PostHandler = PostHandler;
	handler.handle(req, res, next);
}

exports.subcategory = function(req, res, next){		
	console.log("sub");
	var handler = require(__dirname + "/handlers/resource_subcategory");	
	req.PostHandler = PostHandler;
	handler.handle(req, res, next);	
}