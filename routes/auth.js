exports.auth = function(req, res, next){
	console.log("authenticating...");	
	next();
}