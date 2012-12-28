// we need mongoose
var mongoose = require('mongoose');

var tokenSchema = mongoose.Schema({
	token: String,
	clientID: Number,
	netID: String
});

var Token = module.exports = mongoose.model('Token', tokenSchema);