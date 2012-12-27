// we need mongoose
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    netID: String,
	openID: String
});

console.log( 'hoim' );

var User = module.exports = mongoose.model('User', userSchema);