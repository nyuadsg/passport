// we need mongoose
var mongoose = require('mongoose');
// var Group = require('./group');

// var _ = require('../public/lib/underscore');

var schema = mongoose.Schema({
	"_id": String,
	"value": Object
});

var user_groups = module.exports = mongoose.model('user_groups', schema);