// we need mongoose
var mongoose = require('mongoose');

var tokenSchema = mongoose.Schema({
	clientID: Number,
	netID: String
});

var Token = module.exports = mongoose.model('Token', tokenSchema);