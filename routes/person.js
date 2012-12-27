var User = require('../models/user');

/*
 * GET users listing.
 */

exports.list = function(req, res){
	res.send("respond with a resource");
};

exports.make = function( req, res ) {
	var user = new User({ netID: 'mp3255' });
	console.log(user.netID) // 'Silence'
	user.save();
}

exports.profile = function(req, res){
	var netID = req.params.netID;
		
	User.find({ netID: netID }, function (err, users) {
		res.send( users );
	});
		
	// res.send("netID: bob");
};