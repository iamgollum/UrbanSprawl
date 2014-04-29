
function main(){

	var mapOptions = {
		center: new google.maps.LatLng(42.792025, -75.435944),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		disableDoubleClickZoom: false,
		panControl: false,
		draggable: true,
	    mapTypeControl: true,
	    mapTypeControlOptions: {
	      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	    },
	    zoomControl: true,
	    zoomControlOptions: {
	      style: google.maps.ZoomControlStyle.SMALL,
	      position: google.maps.ControlPosition.TOP_RIGHT
	  	},
	  	zoom: 7
	}

	/* Aar*/
	var mapStyles = {
		'urban': new UrbanTheme(),
		'administrative': new AdministrativeTheme(),
		'transit': new TransitTheme(),
		'water': new InverseWaterTheme()
	}

	var Portal = new UrbanSprawlPortal(mapOptions, mapStyles);

	/* Right Off Canvas Menu Events */
	$('input[type=radio][name=theme]').change(function() {
	    Portal.changeMapStyle($(this).attr('id'));
	});
	
	$('input[type=checkbox][name=overlay]').change(function() {
		var selectedCheckboxValue = $(this).parent().find(':checked').val() || false;
  		Portal.toggleOverlay($(this).attr('id'), selectedCheckboxValue);
	});

	$("input[type=checkbox][name=cluster]").change(function(){
	    Portal.toggleCluster();
	});

	$('input[type=checkbox][name=marker]').change(function(){
	    Portal.toggleMarkers();
	});

  /* Map Toggle View */
	  $("#map-toggle").click(function(){
	  	Portal.slideToggleDashboard($(this));
	  });

	$("#invert-select").click(function(){
	    Portal.invertSelection();
	});

	$("#clear-select").click(function(){
	    Portal.clearSelection();
	});

	$("#histogram").delegate("button", "click", function( event ) {
	  var node = $(this).siblings('.h-subject');
	  var dataset = node.html();
	  var years = node.data('timeline').split(',');

	  if($(this).find('i').hasClass("fi-paint-bucket")){
	  	Portal.generateHeatmap(dataset);
	  } else{
	  	Portal.generateDashboard(dataset, years);
	  }
	});

	//Dynamic additions and removal from heatmap and charts
	$("#histogram").delegate("input", "click", function( event ) {
		var county = $(this).attr("id");
	});

}

google.maps.event.addDomListener(window, 'load', main);