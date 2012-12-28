exports.start = function(req, res){
	// here we redirect to the NYU login and onto the nyu login step here
	var redirect = 'https://login.nyu.edu/sso/UI/Login?goto=' + process.env.base_url + '/auth/nyu';
	res.redirect( redirect );
};

exports.nyu = function(req, res){
	// this intermediary step uses a frame to ensure the NYU token has been passed along to Google
	// it then redirects, via Javascript, to the Google authentication step
	res.render("auth_nyu", {
		title: "Authentication...",
		next: process.env.base_url + '/auth/google'
	});
};

exports.fail = function(req,res){
	res.render("auth_fail", {
		title: "Authentication failed",
		next: process.env.base_url + '/auth/start'
	});
}