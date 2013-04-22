// we need mongoose
var mongoose = require('mongoose');
var User = require('./user');
var async = require('async');

var _ = require('../public/lib/underscore');

var groupSchema = mongoose.Schema({
	"slug": { type: String, required: true, index: { unique: true }, lowercase: true },
	"name": String,
	"admins": [ { type: String } ],
	"subgroups": [ { type: String } ],
	"explicit_members": [ { type: String } ],
	"all_members": [ { type: String } ]
});

groupSchema.methods.addUser = function (netID, cb) {	
	this.update( { $addToSet: { "explicit_members": netID } }, {}, function( err ) {
		// rebuild map/reduce
		Group.updateMR();
		
		cb( err );
	});
	
	// also make sure the user exists
	User.findOneAndUpdate( { netID: netID }, { netID: netID }, { upsert: true }, function( err, user ) {
		// no callback; this could fail silently
	} );
}

groupSchema.methods.removeUser = function (user, cb) {
	this.update( { $pull: { "explicit_members": user.netID } }, {}, function( err ) {
		// rebuild map/reduce
		Group.updateMR();
		
		cb( err );
	});	
	
// 	groups = user.groups;
// 	for(var i in groups){
// 		if(groups[i] == this.slug){
// 			groups.splice(i,1);
// 		}
// 	}
// 	user.groups = groups;
// 	return user.save( function( err ) {
// 		cb( err, user );
// 	});
}

addImplicitGroups = function( group, prefix ) {
	// group.members({}, function( err, members ) {
	// 	_.each( members, function( member ) {
	// 		member.implicit_groups.push( prefix + ':' + group.slug );
	// 		member.save( function() {} );
	// 	});
	// });
}

groupSchema.methods.addGroup = function (sg, cb) {
	slug = this.slug;
	
	this.subgroups.push( sg.slug );
	
	this.subgroups = _.uniq( this.subgroups );
	
	return this.save( function( err ) {
		
		Group.updateMR();
				
		cb( err, sg );
	});
}

groupSchema.methods.removeGroup = function (sg, cb) {	
	this.subgroups = _.without( this.subgroups, sg.slug );
	
	return this.save( function( err ) {
		Group.updateMR();
		
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

// gets all members, including implicit members
groupSchema.methods.getMembers = function (cb) {
	// console.log( this.name );
	// console.log( this.explicit_members );
	members = this.explicit_members;
	
	sug = this;
	
	if( this.subgroups.length == 0 ) {
		cb( null, members );
	}
	else
	{
		this.getSubgroups({}, function( err, subgroups ) {
			async.mapSeries(
				subgroups,
				function( sg, next ) {

					sg.getMembers( function( err, sgmmbrs ) {
						next( err, sgmmbrs );
					});
				},
				function( err, mmbrs ) {
					// console.log( mmbrs );

					members = members.concat( mmbrs );
					members = _.flatten( members );
					members = _.uniq( members );

					cb( err, members );
				}
			);
		});
	}
}

groupSchema.methods.getExplicitMembers = function (where, options, cb) {
	var query = User.find( where );

	query.where('netID').in( this.explicit_members );
		
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

// regenerate the member_groups table
groupSchema.statics.updateMR = function( cb ) {
	Group.find({}, function( err, groups ) {
		async.each(
			groups,
			function( g, cb ) {
				g.getMembers( function( err, members ) {
					g.update( { "$set": { "all_members": members } }, {}, function( err ) {
						cb();
					});
				});
			},
			function( err ) {
				// console.log( groups );
				
				// console.log( groups );
				var o = {
					map: function() {			
						g = this;

						// mLog( this );

						if( this.all_members )
						{
							this.all_members.forEach( function( netID ) {
								emit( netID, g.slug );
							} );	
						}

					},
					reduce: function( key, values ) {
						return {
							groups: values
						};
					},
					finalize: function( key, values ) {
						if( typeof values == "string" )
						{
							return {
								groups: [ values ]
							}
						}
						else
						{
							return values;
						}
					},
					out: { replace: 'user_groups' }
				};

				Group.mapReduce(o, function (err, results) {		
					if( err )
					{
						console.log( err );
					}

					// console.log( results );

					// cool, now send these reduced groups into the user collection

					// console.log( "mapping into the main users collection" );
					// 
					// // console.log( results );
					// 
					// async.each( results, function( result, cb ) {
					// 	// console.log( result );
					// 	// console.log( result );
					// 	// immediate callback
					// 	cb();
					// 	User.update( { netID: result._id }, {"$set": { "groups": result.value.groups } }, {}, function( err ) {
					// 		// console.log( err );
					// 	} );
					// });
					// 
					// console.log( 'done?' );

				});
			}
		);
	});
}

var Group = module.exports = mongoose.model('Group', groupSchema);