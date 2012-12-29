var User = require('../models/user');
var api = require('../api');

/*
 * GET users listing.
 */

exports.list = function(req, res){
	res.send("respond with a resource");
};

exports.me = function( req, res ) {
	if( req.user == undefined )
	{
		res.redirect(  process.env.base_url + '/auth/start?next=' + process.env.base_url + '/person/me' );
	}
	else
	{
		res.send( 'Hello, ' + req.user.name + '. Your netID is ' + req.user.netID );
	}
}

exports.profile = function(req, res){
	var netID = req.params.netID;
		
	User.find({ netID: netID }, function (err, users) {
		res.send( users );
	});
		
	// res.send("netID: bob");
};

exports.api = {
	me: [
		api.passport.authenticate('bearer', { session: false }),
		function( req, res ) {
			api.respond( res, {
				netID: req.user.netID
			});
		}]
}