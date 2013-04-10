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
	return user.save( function( err ) {
		cb( err, user );
	});
}

groupSchema.methods.removeUser = function (user, cb) {
	groups = user.groups;
	for(var i in groups){
		if(groups[i] == this.slug){
			groups.splice(i,1);
		}
	}
	user.groups = groups;
	return user.save( function( err ) {
		cb( err, user );
	});
}

groupSchema.methods.members = function (where, cb) {
	var query = User.find( where );
		
	query.where('groups').all([ this.slug ]);
		
	query.exec( cb );
}

groupSchema.methods.countMembers = function (where, cb) {
	var query = User.count( where );
		
	query.where('groups').all([ this.slug ]);
		
	query.exec( function( err, count ) {
		this._count = count;
		
	} );
}

groupSchema.virtual('url').get(function () {
  return {
		view: process.env.base_url + '/groups/' + this.slug + '/view',
		add: process.env.base_url + '/groups/' + this.slug + '/add',
		remove: process.env.base_url + '/groups/' + this.slug + '/remove'
	};
});

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