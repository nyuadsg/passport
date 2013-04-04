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

userSchema.virtual('email').get(function () {
  return this.netID + '@nyu.edu';
});

var User = module.exports = mongoose.model('User', userSchema);