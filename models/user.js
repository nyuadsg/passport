// we need mongoose
var mongoose = require('mongoose');
var UserGroups = require('./usergroups');

var _ = require('../public/lib/underscore');

var userSchema = mongoose.Schema({
	netID: String,
	"name": String,
	"groups": [ { type: String } ]
});

// regenerate implicit groups
// userSchema.methods.regenerateGroups = function( group ) {
	// user = this;
// 	
// 	// query = Group.find({});
// 	
// 	// .where('subgroups').any(this.groups).exec( function( err, groups ) {
// 	// 		console.log( groups );
// 	// 	});
// 		
// 	console.log( Group );
// 	
// }

userSchema.methods.isIn = function( groupString ) {
	// return true;
	return ( this.groups.indexOf( groupString ) != -1 );
}

userSchema.methods.can = function( permission ) {
	if (permission === 'access_groups') {
		if (this.isIn('see-groups') || this.isIn('admins')) {
			return true;
		}
	}
	return
}

userSchema.statics.fetch = function( where, cb ) {
	if( typeof where == 'string' )
	{
		where = { 'netID': where };
	}
	
	User.findOne( where, function( err, user ) {
		if( err ) {
			cb( err, null );
		}
		else
		{
		    if (user == null) {
		        cb('missing', null);
		    } else {
		        q = UserGroups.findById( user.netID, function( err, ug ) {
    				if( ug != null )
    				{
    					user.groups = ug.value.groups;
    				}
    				else
    				{
    					user.groups = [ 'admins' ];
    				}
    				// user.groups = [];
    				cb( err, user );
    			});
		    }
		}
	})
}

userSchema.virtual('email').get(function () {
  return this.netID + '@nyu.edu';
});

userSchema.virtual('url').get(function () {
  return {
		edit: process.env.base_url + '/person/edit?who=' + this.netID
	};
});

var User = module.exports = mongoose.model('User', userSchema);