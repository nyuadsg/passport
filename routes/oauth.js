/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize')
	, login = require('../login')
	, url = require('url')
	, utils = require('../utils');
	
// api
var api = require('../api');

// models
var User = require('../models/user');
var AuthCode = require('../models/authcode');
var Token = require('../models/token');
var Client = require('../models/clients');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function(client, done) {
	return done(null, client.id);
});

server.deserializeClient(function(id, done) {
	// return done( false );
	Client.findOne({id: id}, function(err, client) {
		if (err) { return done(err); }
		return done(null, client);
	});
});

// // Register supported grant types.
// //
// // OAuth 2.0 specifies a framework that allows users to grant client
// // applications limited access to their protected resources.  It does this
// // through a process of the user granting access, and the client exchanging
// // the grant for an access token.
// 
// // Grant authorization codes.  The callback takes the `client` requesting
// // authorization, the `redirectURI` (which is used as a verifier in the
// // subsequent exchange), the authenticated `user` granting access, and
// // their response, which contains approved scope, duration, etc. as parsed by
// // the application.  The application issues a code, which is bound to these
// // values, and will be exchanged for an access token.
// 
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {	
	var code = new AuthCode({
		code: utils.uid(16),
		clientID: client.id,
		redirectURI: redirectURI,
		netID: user.netID,
	});
	code.save(function(err) {
		if (err) { return done(err); }
		done(null, code.code);
	});
}));

// allow for implicit grants
server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
	// AccessToken.create(client, user, ares.scope, function(err, accessToken) {
	//  *         if (err) { return done(err); }
	//  *         done(null, accessToken);
	//  *       });
	
	// Client.findOne({clientID: client}, function(err, client) {
	// 	if (err) { return done(err); }
	// 		// WARNING: For security purposes, it is highly advisable to check that
	// 		//          redirectURI provided by the client matches one registered with
	// 		//          the server.  For simplicity, this example does not.  You have
	// 		//          been warned.
	// 	console.log( client );
	// 	return done(null, client, redirectURI);
	// });
	
	// console.log( client );
	
	var token = new Token({
		token: utils.uid(256),
		clientID: client.id,
		netID: user.netID
	});
	token.save(function(err) {
		if (err) { return done(err); }
		done(null, token.token);
	});
}));

// // Exchange authorization codes for access tokens.  The callback accepts the
// // `client`, which is exchanging `code` and any `redirectURI` from the
// // authorization request for verification.  If these values are validated, the
// // application issues an access token on behalf of the user who authorized the
// // code.
// 
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
	AuthCode.findOne({code: code}, function(err, authCode) {
		if (err) { return done(err); }
		// if (client.id !== authCode.clientID) { return done(null, false); } // skip checks (in the future, we really need to )
		// if (redirectURI !== authCode.redirectURI) { return done(null, false); }
				
		var token = new Token({
			token: utils.uid(256),
			clientID: authCode.clientID,
			netID: authCode.netID
		});
		token.save(function(err) {
			if (err) { return done(err); }
			done(null, token.token);
		});
		
	});
}));


// user authorization endpoint
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectURI` be checked against a
// registered value, although security requirements may vary accross
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectURI` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view. 

exports.authorization = [
	login.ensure,
	server.authorization(function(clientID, redirectURI, done) {
		Client.findOne({clientID: clientID}, function(err, client) {
			if (err) { return done(err); }
				// WARNING: For security purposes, it is highly advisable to check that
				//          redirectURI provided by the client matches one registered with
				//          the server.  For simplicity, this example does not.  You have
				//          been warned.
				return done(null, client, redirectURI);
		});
	}),
	function(req, res, next){
		// check if client is preauthed
		if( req.oauth2.client.trusted )
		{
			// simulate the necessary condition of an approval decision
	    req.oauth2.res = {allow: true};
	
			return server.decision({
	      loadTransaction: false
	    })(req, res, next);
		}
		
		// check for previous authorization
		return AuthCode.findOne({clientID: req.oauth2.client.id, netID: req.user.netID}, function(err, authCode) {
						
			// if (err) { return done(err); }
			if( authCode != null )
			{
								
				// simulate the necessary condition of an approval decision
		    req.oauth2.res = {allow: true};
		
				return server.decision({
		      loadTransaction: false
		    })(req, res, next);
			}
			
			next();
			
		});
	},
	function(req, res, next){
		res.render("dialog", {
			title: "Access Authorization",
			Client: req.oauth2.client,
			Scopes: req.oauth2.client.scopes,
			Transaction: req.oauth2.transactionID,
			api: api
		});
		// res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
	}
]

// AuthController.before('launch', function(req, res, next){
//   var server = this.__req.app.get('oauth2server');
// 
//   // attempt to short-circuit auth based on long-standing prefs
//   model.Authorization.checkForPriorAuthorization({
//     user: req.user,
//     app: req.oauth2.client
//   }, function(err, priorAuthExists){
//     if (priorAuthExists) {
// 
//       // simulate the necessary condition of an approval decision
//       req.oauth2.res = {allow: true};
// 
//       return server.decision({
//         loadTransaction: false
//       }, onDecision)(req, res, next);
// 
//     }
//     next();
//   });
// });


// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
	// function(res, req, next) {
	// 	console.log( req.user );
	// 	next();
	// },
	server.decision()
]

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
	// passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
	server.token(),
	server.errorHandler()
]

// helper to chose the proper flow
// (normal or clientside)
exports.begin = function( req, res ) {
	
	query = req.query;
	
	// token-based, so start our fancy little bit
	if( req.query.response_type == 'token' )
	{
		// save original redirect
		req.session.next = query.redirect_uri;
		
		// change query
		query.response_type = 'code';
		query.redirect_uri = process.env.base_url + '/visa/oauth/end';
	}
	
	res.send( query );
}