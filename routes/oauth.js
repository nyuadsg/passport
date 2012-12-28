// load oauth library
var oauth2orize = require('oauth2orize');

// start server
var server = oauth2orize.createServer();

// basic grant
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
	var code = utils.uid(16);

	var ac = new AuthorizationCode(code, client.id, redirectURI, user.id, ares.scope);
	ac.save(function(err) {
	if (err) { return done(err); }
	return done(null, code);
	});
}));