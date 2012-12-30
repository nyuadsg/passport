// we need mongoose
var mongoose = require('mongoose');

var clientSchema = mongoose.Schema({
	id: Number,
	name: String,
	clientID: String,
	clientSecret: String,
	scopes: Array
});

var Client = module.exports = mongoose.model('Client', clientSchema);