var User = require('../models/user');
var api = require('../api');

/*
 * GET users listing.
 */

exports.list = function(req, res){
	User.find().exec( function( err, results ) ) {
		console.log( results );
		res.send("respond with a resource");
	}
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
		}];
	profile: 	[
			api.passport.authenticate('bearer', { session: false }),
			function( req, res ) {
				var netID = req.params.netID;

				User.find({ netID: netID }, function (err, users) {
					api.respond( res, users.pop() );
				});
			}];
}