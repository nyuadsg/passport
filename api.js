var passport = require('passport')
	, BearerStrategy = require('passport-http-bearer').Strategy

var User = require('./models/user');
var Token = require('./models/token');
var Client = require('./models/clients');

var scopes = {
	'user.me.netID': 'Know your netID.'
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