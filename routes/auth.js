// 
// // Google will redirect the user to this URL after authentication.  Finish
// // the process by verifying the assertion.  If valid, the user will be
// // logged in.  Otherwise, authentication has failed.
// app.get('/auth/google/return', 
// 	passport.authenticate('google', { successRedirect: '/',
//                                     failureRedirect: '/login' }));

exports.google = function(req, res){
	passport.authenticate('google');
	// res.send("respond with a resource");
};

// exports.list = function(req, res){
// 	res.send("respond with a resource");
// };