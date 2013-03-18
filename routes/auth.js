exports.start = function(req, res){
	if( req.query.next != undefined )
	{
		// set where they should continue onto
		req.session.next = req.query.next;
	}
		
	// here we redirect to the NYU login and onto the nyu login step here
	var redirect = process.env.base_url + '/auth/google';
	res.redirect( redirect );
};

exports.finish = function(req, res){
	// pass people along to their final destination
	if( req.session.next != undefined )
	{
		// send to next, if set
		res.redirect( req.session.next );
	}
	else
	{
		// otherwise, send home
		res.redirect( process.env.base_url );
	}
};

exports.nyu = function(req, res){
	var redirect = process.env.base_url + '/auth/google';
	res.redirect( redirect );
	// we no longer need to redirect more
	// 
	// // this intermediary step uses a frame to ensure the NYU token has been passed along to Google
	// // it then redirects, via Javascript, to the Google authentication step
	// res.render("auth_nyu", {
	// 	title: "Authentication...",
	// 	next: process.env.base_url + '/auth/google'
	// });
};

exports.fail = function(req,res){	
	res.render("auth_fail", {
		title: "Authentication failed",
		next: process.env.base_url + '/auth/start'
	});
}

exports.logout = function( req, res ) {
	req.logout();
	
	var redir = 'https://accounts.google.com/logout';
	
	res.redirect( redir );
}