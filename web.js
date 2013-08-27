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
	, providers = require('./routes/providers')
	, oauth = require('./routes/oauth')
	, auth = require('./routes/auth');

var _ = require('./public/lib/underscore');	

// prepare database
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOURL || process.env.MONGOLAB_URI || process.env.MONGOHQ_URLL || 'mongodb://localhost/passport');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {});

// load models
var User = require('./models/user');
var Group = require('./models/group');
var AuthCode = require('./models/authcode');
var Token = require('./models/token');
var Client = require('./models/clients');
var Provider = require('./models/provider');

// start app server
var app = express();

var allowCrossDomain = function(req, res, next) {		
		var oneof = false;
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*');
        oneof = true;
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
}

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
	app.use(allowCrossDomain);
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

// Authentication componennt
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
			// first store token
			Provider.storep( {
				provider: 'google',
				netID: netID,
				accessToken: accessToken,	
				refreshToken: refreshToken
			}, function( err, prov ) {
			});

			User.fetch({ netID: netID }, function (err, user) {

				var user = user;


				if( user == null )
				{
				    // create a new user	    
                    var user = new User({
                        netID: netID,
                        name: profile.name.givenName + ' ' + profile.name.familyName
                    });
                    user.save(function(err) {
                        done(err, user);
                    });
				}
				else
				{
					done( err, user );
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

// --- Google
app.get('/auth/google/return', passport.authenticate('google', {
	successRedirect: '/auth/finish',
	failureRedirect: '/auth/fail'
}));
app.get('/auth/google', function(req, res, next ) {
	options = {
		'scope': ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
		'hd': 'nyu.edu',
		accessType: 'offline'
	};
	if( req.session.client_id != undefined )
	{
		Client.findOne({clientID: req.session.client_id}, function(err, client) {
			if (err) { return done(err); }
			if( client != null )
			{
				if( client.getScopes( 'google' ).length > 0 )
				{
					req.session.gscopes = client.getScopes( 'google' );
					options.scope = _.union( options.scope, client.getScopes( 'google' ) );
				}
			}
						
			// call passport directly with some dynamic options based on `req` and `res`
		  return passport.authenticate('google', options)(req, res, next);
		});
	}
	else
	{
		return passport.authenticate('google', options)(req, res, next);
	}
} );


// finish the Google auth loop
app.get('/auth/finish', auth.finish);
// -- enable logout
app.get('/auth/logout', auth.logout);
// -- profiles
app.get('/person/me', person.me);
// app.get('/person/update', person.update);
app.get('/person/list', person.list.index);
app.get('/person/create', person.create.gui);
app.post('/person/create', person.create.save);
app.get('/person/edit', person.edit.gui);
app.post('/person/edit', person.edit.update);
app.get('/person/list/:school/:class/:select', person.list.view);
// -- groups
app.get('/people', groups.list.gui);
app.get('/groups', groups.list.gui);
app.post('/groups/new', groups.new.gui);
app.get('/groups/:slug/view', groups.view.gui);
app.post('/groups/:slug/add', groups.add.gui);
app.get('/groups/:slug/remove', groups.remove.gui);
app.get('/groups/:slug/promote', groups.promote.gui);
app.get('/groups/:slug/demote', groups.demote.gui);
// -- oauth
app.get('/visa/oauth', oauth.authorization);
app.get('/visa/oauth/authorize', oauth.authorization);
app.post('/visa/oauth/decision', oauth.decision);
app.post('/visa/oauth/token', oauth.token);
// -- client/side oauth
// app.get('/visa/oauth/simple', oauth.simple );
// -- tokens for other services
app.get('/visa/:provider/token', providers.token);
// -- api
app.get('/visa/use/info/me', person.api.me);
app.get('/visa/use/info/profile/:netID', person.api.profile);
app.get('/api/info/me', person.api.me);
app.get('/api/info/profile/:netID', person.api.profile);
app.get('/api/person/query', person.api.query);
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