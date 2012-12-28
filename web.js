// load dependencies
var express = require('express')
	, http = require('http')
	, path = require('path')
	, routes = require('./routes')
	, person = require('./routes/person')
	, auth = require('./routes/auth');
var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;

// prepare database
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
});

// schema for users
var User = require('./models/user');

// start app server
var app = express();

// configure express
app.configure(function(){
	app.set('port', process.env.PORT || 5000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser( process.env.secret ));
	app.use(express.session({ secret: process.env.secret }));
	app.use(passport.initialize());
	app.use(passport.session());  
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(__dirname + '/public'));
});

// --- development
app.configure('development', function(){
	app.use(express.errorHandler());
});

// authentication with passport
passport.serializeUser(function(user, done) {
	done(null, user.netID);
});

passport.deserializeUser(function(id, done) {
	User.findOne({netID: id}, function(err, user) {
		done(err, user);
	});
});

passport.use(new GoogleStrategy({
	returnURL: process.env.base_url + '/auth/google/return',
	realm: process.env.base_url
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
		User.findOne({ netID: netID }, function (err, user) {
			if( user == null ) 
			{
				var user = new User({
					netID: netIDs,
					openID: identifier
				});
				user.save(function() {
					done(err, user);
				});
			}
			else
			{
				if( user.openID == identifier )
				{
					done(err, user);
				}
				else
				{
					console.log( 'mayday' );
				}
			}
			
		});
		
	}
	else
	{
		done( 'salam', false );
	}
  }
));

// all routes
app.get('/', function(req,res) {
	console.log( 'bob' );
	res.send('bobby died last night; ddid you notice? Does it work yet? NOW? 1 more try');
});
app.get('/auth/start', auth.start);
app.get('/auth/nyu', auth.nyu);
app.get('/auth/google', passport.authenticate('google')); // Redirect the user to Google for authentication
app.get('/auth/google/return', passport.authenticate('google', {
	successRedirect: '/person/me',
	failureRedirect: '/auth/web'
})); // finish the Google auth loop
app.get('/person/me', person.me);
app.get('/person/profile/:netID', person.profile);

// start listening
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});