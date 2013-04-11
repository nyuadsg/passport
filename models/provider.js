// we need mongoose
var mongoose = require('mongoose');
var request = require('request');

var providerSchema = mongoose.Schema({
	provider: String,
	netID: String,
	accessToken: String,
	refreshToken: String,
	scopes: []
});

providerSchema.statics.getToken = function (provider, netID, scopes, cb) {
	PS = this;
	
	PS.findOne( {provider: provider, netID: netID, refreshToken: { "$exists": true } }).where('scopes').all( scopes ).exec( function( err, token ) {
		if( err )
		{
			cb( err, null )
		}
		else if( token == null )
		{
			cb( err, null )
		}
		else
		{	
			url = 'https://accounts.google.com/o/oauth2/token'
			// '?grant_type=refresh_token&client_id=' + process.env.GOOGLE_ID + '&client_secret=' + process.env.GOOGLE_SECRET + '&refresh_token=' + token.refreshToken );
			
			request({
				url: url,
				method: 'POST',
				form: {
					grant_type: 'refresh_token',
					client_id: process.env.GOOGLE_ID,
					client_secret: process.env.GOOGLE_SECRET,
					refresh_token:token.refreshToken
			}}, function( err, res, body ) {
					body = JSON.parse( body );
					if (!err && res.statusCode == 200) {
						cb( null, body );
					}
			});
			
		}
	});
}


var Provider = module.exports = mongoose.model('Provider', providerSchema);