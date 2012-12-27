var User = require('../models/user');

/*
 * GET users listing.
 */

exports.list = function(req, res){
	res.send("respond with a resource");
};

exports.me = function( req, res ) {
	res.send( 'your net ID is' + req.user.netID );
}

exports.profile = function(req, res){
	var netID = req.params.netID;
		
	User.find({ netID: netID }, function (err, users) {
		res.send( users );
	});
		
	// res.send("netID: bob");
};