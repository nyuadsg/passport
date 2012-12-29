// we need mongoose
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    netID: String,
	openID: String,
	givenName: String,
	familyName: String
});

userSchema.virtual('name').get(function () {
	return this.givenName + ' ' + this.familyName;
});

var User = module.exports = mongoose.model('User', userSchema);