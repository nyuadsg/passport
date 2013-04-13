$(document).ready( function( ) {
	
	// fetch all names
	// $.getJSON( '/api/people/search?type=simple', function( data, status ) {
	// 	$('#lookup input.name').typeahead({
	// 		source: data,
	// 		updater:function (item) {
	// 			$('#lookup input.name').val( item );
	// 			$('#lookup').submit();
	// 			return item;
	// 		}
	// 	});
	// });
	
	$('#lookup input.name').typeahead({
		source: function( term, process) {
			$.getJSON( '/api/person/query?type=simple&term=' + term, function( data, status ) {
				process( data );
			});
		},
		minLength: 2,
		updater:function (item) {
			$('#lookup input.name').val( item );
			$('#lookup').submit();
			return item;
		}
	});
	
	// $('#lookup').submit( function() {		
	// 	$.getJSON( '/api/people/rank?name=' + $('#lookup input.name').val(), function( data, status ) {
	// 		if( data.error == null )
	// 		{
	// 			$('#lookup .rankStat.posts span.number strong').text( data.fbPosts );
	// 			$('#lookup .rankStat.posts span.rank strong').text( data.postRank );
	// 
	// 			$('#lookup .rankStat.comments span.number strong').text( data.fbComments );
	// 			$('#lookup .rankStat.comments span.rank strong').text( data.commentRank );
	// 			
	// 			$('.rankStat').slideDown();
	// 		}
	// 		else
	// 		{
	// 			alert( data.error );
	// 		}			
	// 	});		
	// 	return false;
	// });
	
});