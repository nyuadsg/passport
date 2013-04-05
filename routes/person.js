var User = require('../models/user');
var Group = require('../models/group');
var api = require('../api');

/*
 * GET users listing.
 */


access_admin = function(req, res, next) {
	admins = ["mp3255","lmr439","bmb351"]
	
	console.log( req.user );
	
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

// custom method for updating data
// exports.update = [
// 	access_admin,
// 	function( req, res ) {
// 		changes = [
// 			{"netID": "mp2", "name": "New Name"},
// 		];
// 		console.log( 'processing' );
// 		changes.forEach( function( value, index) {
// 			User.update({ 'netID': value.netID }, { $set: { 'name': value.name }}, function( err, resp) {
// 				console.log( err, resp );
// 			});
// 			// console.log( value );
// 		});
// 		res.send( 'done' );
// 		// res.redirect( process.env.base_url );
// 	}
// ]

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
				
			// only show members of the NYUAD "student body"
			query.or([
				{ site: 'AD' }, // everyone studying in Abu Dhabi
				{ school: 'NYUAD' } // everyone who is an NYUAD student
			]);
		
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
			if( api.can( 'user.me.netID', req.authInfo.scopes ) ) {
				profile.netID = req.user.netID
			}
			if( api.can( 'user.me.name', req.authInfo.scopes ) ) {
				profile.name = req.user.name
			}
			if( api.can( 'user.me.class', req.authInfo.scopes ) ) {
				profile.class = req.user.class
			}
			if( api.can( 'user.me.school', req.authInfo.scopes ) ) {
				profile.school = req.user.school;
				profile.site = req.user.site;
			}
			api.respond( res, profile);
		}],
	profile: 	[
			api.auth,
			function( req, res ) {
				var netID = req.params.netID;

				User.findOne({ netID: netID }, function (err, user) {
					if( user == null ) {
						api.respond( res, { type: 'user.notexist', message: "user does not exist" } );
					}
					else
					{
						profile = {};
						
						profile.netID = user.netID;
						profile.name = user.name;
						profile.class = user.class;
						profile.school = user.school;
						profile.site = user.site;
						
						api.respond( res, profile );
					}
				});
			}]
}