var User = require('../models/user');

exports.passport = function(req, res){
	res.render("about_passport", {
		title: "What is Passport?"
	});
};

// exports.report = function( req, res ) {
// 	total = people.length; // 266
// 	User.count().where('school').equals("NYUNY").where('netID').in(people).exec(function( er, ppl) {
// 		console.log( ppl );
// 	});
// 	res.render("report", {
// 		title: "Report"
// 	});
// }