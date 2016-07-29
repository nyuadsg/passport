var User = require('../models/user');
var Group = require('../models/group');
var api = require('../api');
var login = require('../login');
var _ = require('../public/lib/underscore');

/*
 * GET users listing.
 */


access_admin = login.access_admin;

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

exports.me = [
	login.ensure,
	function( req, res ) {
		res.render( 'profile', {
			title: 'Your Profile',
			user: req.user,
			access: {
				access_groups: req.user.can('access_groups')
			}
		});
	}
]

exports.create = {
	gui: [
		login.ensure,
		login.access_admin,
		function( req, res, next ) {
			res.render( 'edit_user', {
				title: 'Create User',
				action: process.env.base_url + '/person/create',
				user: {}
			});
			
		}
	],
	save: [
		login.ensure,
		login.access_admin,
		function( req, res, next ) {
			
			User.create( {
				'name': req.body.name,
				'netID': req.body.netID
			}, function( err, user ) {
				res.redirect( process.env.base_url + '/person/edit?who=' + user.netID );
			});
		}
	],
}

exports.edit = {
	gui: [
		login.ensure,
		login.access_admin,
		function( req, res, next ) {
			term = req.query.who;
			
			where = {'$or': [
				{ 'name': { '$regex': term + '.*', $options: 'i' } },
				{ 'netID': { '$regex': term + '.*', $options: 'i' } },
			] };

			User.fetch( where, function( err, user ) {	
				console.log("user", user);
			
				res.render( 'edit_user', {
					title: 'Edit User',
					action: process.env.base_url + '/person/edit?who=' + user.netID,
					user: user
				});
			} );
			
		}
	],
	update: [
		login.ensure,
		login.access_admin,
		function( req, res, next ) {
			term = req.query.who;
			
			where = {'$or': [
				{ 'name': { '$regex': term + '.*', $options: 'i' } },
				{ 'netID': { '$regex': term + '.*', $options: 'i' } },
			] };
			
			User.fetch( where, function( err, user ) {				
				user.name = req.body.name;
				user.netID = req.body.netID;
				
				user.save( function( err, user ) {
					res.redirect( process.env.base_url + '/person/edit?who=' + user.netID );
				});
			});
		}
	],
	deadmin: [
	    login.ensure,
	    login.access_admin,
	    function( req, res, next ) {
	        if (req.user.netID == 'mp3255') {
	            netID = req.query.who;
	            
	            User.fetch({'netID': netID}, function(err, user) {
	                user.groups.forEach(function(slug) {
	                    Group.findOne( {slug: slug }, function( err, group ) {
            				if( err )
            				{
            					res.send( err );
            				}
            				else
            				{
                                group.admins = _.without( group.admins, netID );

                                group.save( function() {});
            				}
            			});
	                });
                    // console.log(user);
	            });
	        }
	        
			res.redirect( process.env.base_url + '/person/edit?who=' + netID );
	    }
	]
}

exports.api = {
	query: [
		login.ensure,
		login.access_admin,
		function( req, res, next ) {
			term = req.query.term;
			type = req.query.type

			responses = [];
			
			where = {'$or': [
				{ 'name': { '$regex': term + '.*', $options: 'i' } },
				{ 'netID': { '$regex': term + '.*', $options: 'i' } },
			] };
			
			User.find( where, function( err, users ) {				
				_.each(users, function (user ) {
					
					if( type == 'simple' )
					{
						if( user.name == null ) {
							responses.push( user.netID );
						}
						else {
							responses.push( user.name );
						}
					}
					else
					{
						responses.push( user );
					}					
				} );

				res.send( responses );
			} );
			
		}
	],
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
			if( api.can( 'user.me.groups', req.authInfo.scopes ) ) {
				profile.groups = req.user.groups;
			}
			api.respond( res, profile);
		}],
	profile: 	[
            // api.auth,
			function( req, res ) {
				var netID = req.params.netID;

				User.fetch({ netID: netID }, function (err, user) {
					if( err || user == null ) {
						api.error( res, 'user.notexist', "user does not exist" );
					}
					else
					{
						profile = {};
						
						profile.netID = user.netID;
						profile.name = user.name;
						profile.groups = user.groups;
						
						api.respond( res, profile );
					}
				});
			}]
}