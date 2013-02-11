// we need mongoose
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	netID: String,
	openID: String,
	"class": Number,
	school: String,
	"name": String
});

userSchema.virtual('email').get(function () {
  return this.netID + '@nyu.edu';
});

var User = module.exports = mongoose.model('User', userSchema);