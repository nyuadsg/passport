var User = require('../models/user');
var api = require('../api');

/*
 * GET users listing.
 */


access_admin = function(req, res, next) {
	admins = ["mp3255","lmr439","bmb351"]
	
	if( req.user == undefined )
	{
		res.redirect(  process.env.base_url + '/auth/start?next=' + process.env.base_url + req.url );
	}
	else if( admins.indexOf( req.user.netID) == -1)
	{
		res.redirect(  process.env.base_url );
	}
	else
	{
		next();
	}
}

exports.list = {
	index: [
		access_admin,
		function(req, res){
			res.render('report', { title: 'Student Body Reports' });
		}
	],
	view: [
		access_admin,
		function(req, res) {
			var query = User.find();
		
			if( req.params.class != "all")
				query.where("class").equals( req.params.class );
		
			if( req.params.select == "netID") {
				query.select("netID");
				output = ["netID"];
			} else if( req.params.select == "email") {
				query.select("netID");
				output = ["email"];
			} else if( req.params.select == "name,netID") {
				query.select("name netID");
				output = ["name", "netID"];
			} else if( req.params.select == "name,class") {
				query.select("name class");
				output = ["name", "class"];
			}
		
			str = ""
			query.stream().on('data', function (doc) {
			  // do something with the mongoose document
				output.forEach( function( key ) {
					str = str + doc[key] + ","
				});
				str = str + "\n";
			}).on('error', function (err) {
			  console.log( err );
			}).on('close', function () {
				res.setHeader("Content-Type", "text/plain");
			  // the stream is closed
				res.send(str);
			});
		}
	]
}

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
		}],
	profile: 	[
			api.auth,
			function( req, res ) {
				var netID = req.params.netID;

				User.findOne({ netID: netID }, function (err, user) {
					if( user == null ) {
						api.respond( res, { message: "user does not exist" } );
					}
					else
					{
						api.respond( res, user );
					}
				});
			}]
}