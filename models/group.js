// we need mongoose
var mongoose = require('mongoose');
var User = require('./user');

var groupSchema = mongoose.Schema({
	"slug": { type: String, required: true, index: { unique: true }, lowercase: true },
	"name": String,
	"admins": [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

groupSchema.methods.addUser = function (user, cb) {
	user.groups.push( this.slug );
	return user.groups.save( function( err ) {
		cb( err, user );
	});
}

groupSchema.statics.newGroup = function( name, slug, cb ) {
	if( slug == undefined || slug == false )
	{
		// slugify
		slug = name.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
		slug = slug.replace(/-/gi, "_");
		slug = slug.replace(/\s/gi, "-");
		slug = slug.toLowerCase();
	}
					
	Group.create({
		name: name,
		slug: slug
	}, function (err, group) {
		if (err)
		{
			Group.newGroup( name, slug + Math.floor((Math.random()*100)+1), cb )
		}
		else
		{
			cb( group );
		}
	});
}

var Group = module.exports = mongoose.model('Group', groupSchema);