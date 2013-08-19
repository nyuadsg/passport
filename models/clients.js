// we need mongoose
var mongoose = require('mongoose');

var _ = require('../public/lib/underscore');	

var clientSchema = mongoose.Schema({
	id: Number,
	name: String,
	clientID: String,
	clientSecret: String,
	scopes: Array,
	trusted: Boolean
});

clientSchema.methods.getScopes = function( type ) {
	return this.model('Client').getScopes( this.scopes, type );
}

clientSchema.statics.getScopes = function( all_scopes, type ) {
	gscopes = [];
	
	scopes = _.filter( all_scopes, function( scope ) {
		gscope = scope.replace( "google:", "" );
		if( ( gscope == scope ) )
		{
			return true;
		}
		else
		{
			gscopes.push( gscope );
			return false;
		}
	});
		
	if( type == 'google' )
	{
		return gscopes;
	}
	else
	{
		return scopes;
	}
}

var Client = module.exports = mongoose.model('Client', clientSchema);