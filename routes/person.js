
/*
 * GET users listing.
 */

exports.list = function(req, res){
	res.send("respond with a resource");
};

exports.profile = function(req, res){
	var netID = req.params.netID;
	
	var user = new User({ netID: "mp32" });
	
	res.send("netID: bob");
};