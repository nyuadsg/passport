var passport = require('passport')
	, BearerStrategy = require('passport-http-bearer').Strategy

var User = require('./models/user');
var Token = require('./models/token');
var Client = require('./models/clients');

var scopes = {
	'user.me.netID': 'Know your netID',
	'user.me.name': 'Know your name',
	'user.me.groups': 'Manage groups you are in',
	'groups.manage': 'Manage group memberships',
	'github': 'See your public GitHub information'
}

passport.use(new BearerStrategy(
	function(accessToken, done) {			
		Token.findOne({token: accessToken}, function(err, token) {
			if (err) { return done(err); }
			if (!token) { return done(null, false); }
								
			// console.log( token.clientID );
			Client.findOne( {id: token.clientID}, function( err, client ) {
				
				User.fetch({netID: token.netID}, function( err, user) {					
					if (err) { return done(err); }
					if (!user) { return done(null, false); }
					var info = { client: client.id, scopes: client.scopes };
					done(null, user, info);
				});
			} );
			
		});
	}
));

exports.passport = passport;


exports.auth = function(req, res, next) {
  passport.authenticate('bearer', { session: false }, function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { // auth fallback
			Client.findOne({ clientID: req.query.client, clientSecret: req.query.secret }, function( err, client ) {
				if (err || client == null) {
					res.send('Unauthorized')
				}
				else
				{
					req.authInfo ={
						scopes: client.scopes
					};
					next();
				}
			});
		}
    else
		{
			next();
		}
  })(req, res, next);
};

// exports.auth = function( req, res, next ) {
// 	passport.authenticate('bearer', { session: false }, function( req, res, next ) {
// 		
// 	} ), // check with bearer
// }
// 	function( req, res, next ) {
// 
// 		// console.log( req.query.access_token );
// 
// 		// console.log( req.query.client );
// 
// 		// res.send( 'error' );
// 
// 		// api.passport.authenticate('bearer', { session: false })

// 	}
// ]


exports.respond = function( res, output ) {
	res.json( output );
}

exports.error = function( res, type, message ) {
	res.json( {
	    error: type,
	    message: message
	} );
}

exports.scope_name= function( scope ) {
	return scopes[scope];
}

exports.can= function( scope, scopes ) {
	if( scopes.indexOf( scope ) == -1 )
	{
		return false
	}
	else
	{
		return true;
	}
}