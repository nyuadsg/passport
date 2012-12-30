// hard list of clients
// var clients = [
//     {
// 		id: '1',
// 		name: 'RDC Status',
// 		clientId: 'W6zBUBqmHWh3MwnKVsiQx9ez',
// 		clientSecret: 'geF6A6RaBYKVr4i',
// 		scopes: [
// 			'user.me.netID'
// 		]
// 	}
// ];

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

// exports.find = function(id, done) {
//   for (var i = 0, len = clients.length; i < len; i++) {
//     var client = clients[i];
//     if (client.id === id) {
//       return done(null, client);
//     }
//   }
//   return done(null, null);
// };
// 
// exports.findByClientId = function(clientId, done) {
//   for (var i = 0, len = clients.length; i < len; i++) {
//     var client = clients[i];
//     if (client.clientId === clientId) {
//       return done(null, client);
//     }
//   }
//   return done(null, null);
// };
// 
// exports.get = function( id, done ) {
// 	
// 	console.log( id );
// }