var passport = require('passport')
	, BearerStrategy = require('passport-http-bearer').Strategy

var User = require('./models/user');
var Token = require('./models/token');

passport.use(new BearerStrategy(
	function(accessToken, done) {
		Token.findOne({token: accessToken}, function(err, token) {
			if (err) { return done(err); }
			if (!token) { return done(null, false); }
			
			User.findOne({netID: token.netID}, function( err, user) {
				if (err) { return done(err); }
				if (!user) { return done(null, false); }
				var info = { scope: '*' }; // at some point, scopes should be implemented
				done(null, user, info);
			});
			
		});
	}
));

exports.passport = passport;

exports.respond = function( res, output ) {
	res.json( output );
}