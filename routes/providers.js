var User = require('../models/user');
var Client = require('../models/clients');
var Provider = require('../models/provider');
var api = require('../api');

exports.token = [
	api.passport.authenticate('bearer', { session: false }),
	function(req, res){
		scopes = Client.getScopes( req.authInfo.scopes, 'google' );
		
		Provider.getToken( req.params.provider, req.user.netID, scopes, function( err, token ) {
			if( token == null )
			{
				api.respond( res, {
					'error': {
						'code': 404,
						'message': 'No token found with those scopes for that provider.'
					},
					'action': {
						'message': 'You probably need to redirect through the authorization flow again.'
					}
				});
			}
			else
			{
				api.respond( res, {
					"expires_in": token.expires_in,
					"access_token": token.access_token
				} );
			}
		});
	}
];