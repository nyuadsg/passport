// we need mongoose
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	netID: String,
	openID: String,
	"class": Number,
	school: String,
	'site': {type: String, default: 'AD'}, // the site the person is currently studying at
	"name": String,
	"groups": [{ type: String }]
});

userSchema.methods.isIn = function( groupString ) {
	return ( this.groups.indexOf( groupString ) != -1 );
}

userSchema.virtual('email').get(function () {
  return this.netID + '@nyu.edu';
});

var User = module.exports = mongoose.model('User', userSchema);