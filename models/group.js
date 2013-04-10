// we need mongoose
var mongoose = require('mongoose');
var User = require('./user');

var _ = require('../public/lib/underscore');

var groupSchema = mongoose.Schema({
	"slug": { type: String, required: true, index: { unique: true }, lowercase: true },
	"name": String,
	"admins": [ { type: String } ],
	"subgroups": [ { type: String } ]
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

groupSchema.methods.addGroup = function (sg, cb) {
	this.subgroups.push( sg.slug );
	
	this.subgroups = _.uniq( this.subgroups );
	
	return this.save( function( err ) {
		
		sg.members({}, function( err, members ) {
			_.each( members, function( member ) {
				// member.regenerateGroups();
			});
		});
		
		cb( err, sg );
	});
}

groupSchema.methods.removeGroup = function (sg, cb) {	
	this.subgroups = _.without( this.subgroups, sg.slug );
	
	return this.save( function( err ) {
		cb( err, sg );
	});
}

groupSchema.methods.isAdmin = function ( who ) {
	if( who.netID != null )
	{				
		if( this.admins.indexOf( who.netID ) != -1 )
		{
			return true;
		}
	}
	
	return false;
}

groupSchema.methods.canAdmin = function( who ) {	
	if( this.isAdmin( who ) )
	{
		return true;
	}
	
	// check for admins
	if( who.netID != null )
	{
		if( who.isIn( 'admins' ) )
		{
			return true;
		}
	}
	
	return false;
}

groupSchema.methods.getSubgroups = function (where, cb) {
	var query = Group.find( where );
	// 	
	query.where('slug').in( this.subgroups );
	// 	
	query.exec( cb );
	// cb()
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
		remove: process.env.base_url + '/groups/' + this.slug + '/remove',
		promote: process.env.base_url + '/groups/' + this.slug + '/promote',
		demote: process.env.base_url + '/groups/' + this.slug + '/demote'
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