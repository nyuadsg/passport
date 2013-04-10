// we need mongoose
var mongoose = require('mongoose');
var utils = require('../utils');

var tokenSchema = mongoose.Schema({
	token: String,
	clientID: Number,
	netID: String
});

tokenSchema.statics.getToken = function (clientID, netID, cb) {
	Tk = this;
	
	Tk.findOne( {clientID: clientID, netID: netID}, function( err, token ) {
		if( !token )
		{
			Tk.create( { token: utils.uid(256), clientID: clientID, netID: netID }, function( err, token ) {
				cb( err, token.token );
			})
		}
		else
		{
			cb( null, token.token );
		}
	});
}

var Token = module.exports = mongoose.model('Token', tokenSchema);