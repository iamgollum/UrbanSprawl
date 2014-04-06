function main(){

	var mapOptions = {
		center: new google.maps.LatLng(42.792025, -75.435944),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		panControl: false,
	    mapTypeControl: true,
	    mapTypeControlOptions: {
	      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	    },
	    zoomControl: true,
	    zoomControlOptions: {
	      style: google.maps.ZoomControlStyle.SMALL,
	      position: google.maps.ControlPosition.TOP_RIGHT
	  	},
	  	zoom: 6
	}

	/* Aar*/
	var mapStyles = {
		'urban': new UrbanTheme(),
		'transit': new TransitTheme(),
		'water': new InverseWaterTheme()
	}

	var Portal = new UrbanSprawlPortal(mapOptions, mapStyles);

	/* Right Off Canvas Menu Events */
	$('input[type=radio][name=theme]').change(function() {
	    Portal.changeMapStyle($(this).attr('id'));
	});
	$('input[type=checkbox][name=overlay]').click(function() {
		var selectedCheckboxValue = $(this + ':checked').val() || false;
  		Portal.toggleOverlay($(this).attr('id'));
	});
	$("input[type=checkbox][name=cluster]").click(function(){
	    Portal.toggleCluster();
	});
	$('input[type=checkbox][name=marker]').click(function(){
	    Portal.toggleMarkers();
	});

  /* Map Toggle View */
	  $("#map-toggle").click(function(){
	    $("#graph-overlay").slideToggle("slow");
	  });

	$("#invert-select").click(function(){
	    Portal.invertSelection();
	});

	$("#clear-select").click(function(){
	    Portal.clearSelection();
	});

}

google.maps.event.addDomListener(window, 'load', main);