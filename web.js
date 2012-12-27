// load dependencies
var express = require('express');
var request = require('request');

// prepare database
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});

// schema for users
var userSchema = mongoose.Schema({
    netID: String,
	openID: String
});
var User = mongoose.model('User', userSchema);

// test user
// var silence = new User({ net_id: 'mp3255' });
// console.log(silence.net_id); // 'Silence'

// https://www.google.com/accounts/o8/id?id=AItOawk1WnokPcQgx29RSrjlyYsNriLWnJQJXMk

// silence.save(function (err, fluffy) {
//   if (err) // TODO handle the error
//   console.log( 'saved to db' );
// });

// authentication with passport
var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;

passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:9080/auth/google/return',
    realm: 'http://localhost:9080'
  },
  function(identifier, profile, done) {
	// ensure they are actually an NYU user
	var valid = false;
	var pattern=/(\w+)@nyu.edu/i;
	
	for (var i=0; i<profile.emails.length; i++)
	{
		// address is from NYU
		match = profile.emails[i].value.match(pattern);
				
		if( match != null )
		{			
			netID = match[1];
			valid = true;
		}
	}
	if( valid )
	{
		console.log( netID );
	}
	else
	{
		done( 'salam', false );
	}
  }
));

// start app server
var app = express.createServer(express.logger());

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at
//     /auth/google/return
app.get('/auth/google', passport.authenticate('google'));

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
app.get('/auth/google/return', 
	passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/login' }));

// start listening
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});