exports.ensure = function(req, res, next) {
	if( req.user == undefined )
	{
		res.redirect(  process.env.base_url + '/auth/start?next=' + encodeURIComponent( process.env.base_url + req.url ) );
	}
	else
	{
		next();
	}
	// if (typeof options == 'string') {
	// 		options = { redirectTo: options }
	// 	}
	// 	options = options || {};
	// 
	// 	var url = options.redirectTo || '/login';
	// 	var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
	// 
	// 	return function(req, res, next) {
	// 	if (!req.isAuthenticated || !req.isAuthenticated()) {
	// 	  if (setReturnTo && req.session) {
	// 	    req.session.returnTo = req.url;
	// 	  }
	// 	  return res.redirect(url);
	// 	}
	// 	next();
	// 	}
}