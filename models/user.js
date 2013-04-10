// we need mongoose
var mongoose = require('mongoose');
// var Group = require('./group');

var userSchema = mongoose.Schema({
	netID: String,
	openID: String,
	"class": Number,
	school: String,
	'site': {type: String, default: 'AD'}, // the site the person is currently studying at
	"name": String,
	"groups": [{ type: String }],
	"implicit_groups": [{ type: String }]
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
	return ( this.groups.indexOf( groupString ) != -1 );
}

userSchema.virtual('email').get(function () {
  return this.netID + '@nyu.edu';
});

var User = module.exports = mongoose.model('User', userSchema);