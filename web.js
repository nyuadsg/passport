// load dependencies
var express = require('express')
	, http = require('http')
	, path = require('path')
var passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var routes = require('./routes')
	, about = require('./routes/about')
	, person = require('./routes/person')
	, groups = require('./routes/groups')
	, oauth = require('./routes/oauth')
	, auth = require('./routes/auth');

// prepare database
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOURL || process.env.MONGOLAB_URI || process.env.MONGOHQ_URLL || 'mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {});

// load models
var User = require('./models/user');
var Group = require('./models/group');
var AuthCode = require('./models/authcode');
var Token = require('./models/token');
var Client = require('./models/clients');

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
	app.use(express.session({ key: 'passport.sess', secret: process.env.secret, maxAge: 10000 }));
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
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.base_url + '/auth/google/return'
  },
  function(accessToken, refreshToken, profile, done) {
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
					done( null, false );
					// var user = new User({
					// 	netID: netID,
					// 	openID: identifier,
					// 	givenName: profile.name.givenName,
					// 	familyName: profile.name.familyName,
					// });
					// user.save(function() {
					// 	done(err, user);
					// });
				}
				else
				{
					// we should possibly auth with openID
					
					// We should fill in names if people don't have them					
					// if( user.name == undefined )
					// 					{
					// 						user.update({
					// 							openID: identifier,
					// 							"name": profile.name.givenName + " " + profile.name.familyName
					// 						});
					// 					}
					// 					else
					// 					{
					// 						user.update({
					// 							openID: identifier
					// 						});
					// 					}					
					
					done(err, user);
				}
			});
		
		}
		else
		{
			done( null, false );
		}
  }
));

// all routes
app.get('/', about.passport);
// -- authorization flow
app.get('/auth/start', auth.start);
app.get('/auth/fail', auth.fail);
app.get('/auth/nyu', auth.nyu);
app.get('/auth/google', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/userinfo.email'],
	hd: 'nyu.edu'
}));
app.get('/auth/google/return', passport.authenticate('google', {
	successRedirect: '/auth/finish',
	failureRedirect: '/auth/fail'
})); // finish the Google auth loop
app.get('/auth/finish', auth.finish);
// -- enable logout
app.get('/auth/logout', auth.logout);
// -- profiles
app.get('/person/me', person.me);
// app.get('/person/update', person.update);
app.get('/person/list', person.list.index);
app.get('/person/list/:school/:class/:select', person.list.view);
// -- groups
app.get('/groups', groups.list.gui);
// -- oauth
app.get('/visa/oauth/authorize', oauth.authorization);
app.post('/visa/oauth/decision', oauth.decision);
app.post('/visa/oauth/token', oauth.token);
// -- api
app.get('/visa/use/info/me', person.api.me);
app.get('/visa/use/info/profile/:netID', person.api.profile);
app.get('/api/info/profile/:netID', person.api.profile);
// -- api / group
app.get('/api/group/new', groups.new.api);
app.get('/api/group/add', groups.add.api);

// -- reports
// app.get('/report', about.report);

// start listening
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});