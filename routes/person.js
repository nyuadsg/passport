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
		res.send( 'Your netID is ' + req.user.netID + ' and you are in the class of ' + req.user.class );
	}
}

exports.profile = function(req, res){
	var netID = req.params.netID;
		
	User.find({ netID: netID }, function (err, users) {
		res.send( users.pop() );
	});
		
	// res.send("netID: bob");
};

exports.api = {
	me: [
		api.passport.authenticate('bearer', { session: false }),
		function( req, res ) {
			profile = {};
			if( api.can( req.authInfo.scopes, 'user.me.netID' ) ) {
				profile.netID = req.user.netID
			}
			if( api.can( req.authInfo.scopes, 'user.me.class' ) ) {
				profile.class = req.user.class
			}
			api.respond( res, profile);
		}]
}