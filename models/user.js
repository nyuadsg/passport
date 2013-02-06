// we need mongoose
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	netID: String,
	openID: String,
	"class": Number,
	school: String,
	"name": String
});

var User = module.exports = mongoose.model('User', userSchema);