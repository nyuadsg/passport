var passport = require('passport')
	, BearerStrategy = require('passport-http-bearer').Strategy

var User = require('./models/user');
var Token = require('./models/token');
var Client = require('./models/clients');

var scopes = {
	'user.me.netID': 'Know your netID',
	'user.me.class': 'Know your graduation year',
	'user.me.name': 'Know your name',
	'user.me.school': 'Know your school at NYU'
}

passport.use(new BearerStrategy(
	function(accessToken, done) {
		Token.findOne({token: accessToken}, function(err, token) {
			if (err) { return done(err); }
			if (!token) { return done(null, false); }
			
			// console.log( token.clientID );
			Client.findOne( {id: token.clientID}, function( err, client ) {
				User.findOne({netID: token.netID}, function( err, user) {
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

exports.auth = function( req, res, next ) {
	passport.authenticate('bearer', { session: false }, next );
	
	// console.log( req.query.client );
	
	// res.send( 'error' );
	
	// api.passport.authenticate('bearer', { session: false })
	Client.findOne({ clientID: req.query.client, clientSecret: req.query.secret }, function( err, client ) {
		if (err || client == null) {
			res.send('Unauthorized')
		}
		else
		{
			next();
		}
	});
}

exports.respond = function( res, output ) {
	res.json( output );
}

exports.scope_name= function( scope ) {
	return scopes[scope];
}

exports.can= function( scopes, scope ) {
	if( scopes.indexOf( scope ) == -1 )
	{
		return false
	}
	else
	{
		return true;
	}
}