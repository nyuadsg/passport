// we need mongoose
var mongoose = require('mongoose');

var authCodeSchema = mongoose.Schema({
	clientID: Number,
	redirectURI: String,
	netID: String
});

var AuthCode = module.exports = mongoose.model('AuthCode', authCodeSchema);