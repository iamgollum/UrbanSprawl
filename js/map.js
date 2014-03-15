/**
 * A singelton instance of the Urban Sprawl Assessment Portal.
 * 
 *
 * @param {Object} opt_options Options such as map, position etc.
 *
 * @constructor
 */
 var UrbanSprawlPortal = function (map_options, map_styles){
	var options = map_options || {};

	this.set('map', new google.maps.Map(document.getElementById('sprawl-map'), options) );
	
	this.styles = map_styles;
	for (key in this.styles){
		this.styles[key].bindTo('map', this);
	}
	this.themeStrategy = map_styles['transit'];

	this.infoBox = $("#info");

	this.markers = [];
	this.weightedLocations = [];

    this.MarkerCluster = null;
    this.cluster_on = false;    
    this.markers_on = true;

	this.overlays = {
		'bikeroute' : new google.maps.BicyclingLayer(),
		'transit' : new google.maps.TransitLayer(),
		'counties' : new google.maps.KmlLayer({
			url: 'https://dl.dropboxusercontent.com/s/fevjaq8q977tn0l/NYCountyBoundaries.kml?dl=1&token_hash=AAF6sV2X7iOiMai5Z17hwY2gaCiCUCMCtK6u3-XbjMT14Q',
		    suppressInfoWindows: true}),
		'heatmap' : new google.maps.visualization.HeatmapLayer(),
	}
	console.log(this.overlays['counties']);
//http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml   https://www.dropbox.com/s/fevjaq8q977tn0l/NYCountyBoundaries.kml
	this.overlayStrategy = this.overlays['heatmap'];

    /* Update Lat and Long */
    themap = this.get('map');
    google.maps.event.addListener(themap,'center_changed', function(e) {
    	window.setTimeout(function() {
      		$("#info").html(themap.getCenter().lat() + ", " + themap.getCenter().lng());
    	}, 200);
    });

	this.themeStrategy.execute(themap);
	this.loadNewYorkData_();
	this.enableBoxSelection_();
	this.enableCountyEvents_();
}
UrbanSprawlPortal.prototype = new google.maps.MVCObject();


UrbanSprawlPortal.prototype.loadNewYorkData_ = function(){

	var southWest = new google.maps.LatLng(42.102961, -79.164429);
	var northEast = new google.maps.LatLng(43.125695, -73.759155);
	var lngSpan = northEast.lng() - southWest.lng();
	var latSpan = northEast.lat() - southWest.lat();

	for (var i = 0; i < 500; i++) {
		// init markers
	    var marker = new google.maps.Marker({
	        position: new google.maps.LatLng(southWest.lat() + latSpan * Math.random(), southWest.lng() + lngSpan * Math.random()),
	        map: this.get('map'),
	        title: 'marker ' + i,
			icon: 'img/small_red.png',
			selected: false,
			state: 'Online',
			id: (i+1),
			visible: true
	    });

	    /* process multiple info windows
	    (function(marker, i) {
	        // add click event
	        google.maps.event.addListener(marker, 'click', function() {
	            infowindow = new google.maps.InfoWindow({
	                content: 'Marker Content'
	            });
	            infowindow.open(this.get('map'), marker);
	        });
	    })(marker, i);*/
	    var wloc = {
	    	location: marker.getPosition(), 
	    	weight: ((Math.random() + 1) * 100)
	    };
	    this.markers.push(marker);
	    this.weightedLocations.push(wloc);
	}
}

UrbanSprawlPortal.prototype.enableCountyEvents_ = function(index){
    google.maps.event.addListener(this.overlays['counties'], 'click', function (kmlEvent) {
        alert(kmlEvent.featureData.name);
        console.log(kmlEvent);
    });
}

UrbanSprawlPortal.prototype.changeMapStyle = function(index){
	this.styles[index].execute(this.get('map'));
	this.themeStrategy = this.styles[index];
}

UrbanSprawlPortal.prototype.toggleCluster = function(){
  if (!this.cluster_on) {
    this.markerCluster = new MarkerClusterer(this.get('map'), this.markers);
    this.cluster_on = true;
  } else {
  	this.markerCluster.clearMarkers();
  	this.markerCluster = null;
    for (var i = 0, marker; marker = this.markers[i]; i++) {
      marker.setMap(this.get('map'));
    }
    this.cluster_on = false;
  }
}

UrbanSprawlPortal.prototype.toggleOverlay = function(index){
	this.overlays[index].setMap(this.overlays[index].getMap() ? null : this.get('map'));
	if (index == "heatmap"){
		this.overlays[index].setData(this.weightedLocations);
	}
}

UrbanSprawlPortal.prototype.toggleMarkers = function(){
    for (var i = 0, marker; marker = this.markers[i]; i++) {
      marker.setMap((this.markers_on) ? null : this.get('map'));
    }
    this.markers_on = (this.markers_on) ? false : true;
}

UrbanSprawlPortal.prototype.enableBoxSelection_ = function(){

	var portal = this;
	portal.mouseDownPos = null;
	portal.gribBoundingBox = null;
	portal.mouseIsDown = 0,
	portal.selecting = false;
	portal.shiftPressed = false;
	themap = portal.map; /*need portal for closure*/


	$(window).keydown(function (evt) {
	    if (evt.which === 16) { // shift
	        portal.shiftPressed = true;
	    }
	}).keyup(function (evt) {
	    if (evt.which === 16) { // shift
	        portal.shiftPressed = false;
	    }
	});

	/* Box Selection Toolbar */
	$("#box-select").click(function(){
	    portal.selecting = true;
	    $(this).css("color","white");
	});

	 google.maps.event.addListener(themap, 'mousemove', function (e) {
	    if (portal.mouseIsDown && (portal.selecting || portal.shiftPressed || portal.gribBoundingBox != null) ) {
	        if (portal.gribBoundingBox !== null) // box exists
	        {         
	            var newbounds = new google.maps.LatLngBounds(portal.mouseDownPos,null);
	            newbounds.extend(e.latLng);    
	            portal.gribBoundingBox.setBounds(newbounds); // If portal statement is enabled, I lose mouseUp events

	        } else // create bounding box
	        {
	            portal.gribBoundingBox = new google.maps.Rectangle({
	                map: themap,
	                bounds: null,
	                fillOpacity: 0.15,
	                strokeWeight: 0.9,
	                clickable: false
	            });
	        }
	    }
	});

	google.maps.event.addListener(themap, 'mousedown', function (e) {
	    if (portal.selecting || portal.shiftPressed) {
	    	$("#box-select").css("color","white");
	        portal.mouseIsDown = 1;
	        portal.mouseDownPos = e.latLng;
	        themap.setOptions({
	            draggable: false
	        });
	    }
	});

	google.maps.event.addListener(themap, 'mouseup', function (e) {
	    if (portal.mouseIsDown && (portal.selecting || portal.shiftPressed|| portal.gribBoundingBox != null)) {
	        portal.mouseIsDown = 0;
	        var markersNumSelected = 0;
	        if (portal.gribBoundingBox !== null) // box exists
	        {
	            var boundsSelectionArea = new google.maps.LatLngBounds(portal.gribBoundingBox.getBounds().getSouthWest(), portal.gribBoundingBox.getBounds().getNorthEast());
	            
	            for (var key in portal.markers) { // looping through my Markers Collection 

					if (portal.gribBoundingBox.getBounds().contains(portal.markers[key].getPosition())) 
					{
						portal.markers[key].setIcon('img/small_yellow.png');
						markersNumSelected++;

					} else {

						portal.markers[key].setIcon('img/small_red.png');
					}
	            }

	            portal.gribBoundingBox.setMap(null); // remove the rectangle
	        }
	        portal.gribBoundingBox = null;
	        portal.selecting = false;
			portal.infoBox.html("Markers selected: " + markersNumSelected + " not-selected: " + (portal.markers.length - markersNumSelected));
	        $("#box-select").css("color","#67676C");
	    }

	    themap.setOptions({
	        draggable: true
	    });
	});

}

UrbanSprawlPortal.prototype.loadDistanceWidget = function(){


/* NEED TO COMPLETE THIS AND HOOK IT IN */

  distanceWidget = new DistanceWidget({
    map: map,
    distance: 50, // Starting distance in km.
    maxDistance: 2500, // Twitter has a max distance of 2500km.
    color: '#000000',
    activeColor: '#5599bb',
    sizerIcon: 'img/resize-off.png',
    activeSizerIcon: 'img/resize.png'
  });

  google.maps.event.addListener(distanceWidget, 'distance_changed',
      updateDistance);

  google.maps.event.addListener(distanceWidget, 'position_changed',
      updatePosition);

  map.fitBounds(distanceWidget.get('bounds'));

  updateDistance();
  updatePosition();
  addActions();
}




function main(){

	var mapOptions = {
		center: new google.maps.LatLng(42.792025, -75.435944),
		zoom: 6,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		zoomControl:false,
		disableDefaultUI: true
	}
	var mapStyles = {
		'urban': new UrbanTheme(),
		'transit': new TransitTheme(),
		'water': new WaterTheme(),
		'inverseWater': new InverseWaterTheme()
	}

	var Portal = new UrbanSprawlPortal(mapOptions, mapStyles);

	/* Theme Selection */
	$("#mapthemes > li > a").click(function(){
	    Portal.changeMapStyle($(this).attr('id'));
	});
	$('#overlays input[type=checkbox]').change(function() {
  		Portal.toggleOverlay($(this).attr('id'));
	});
	$("#cluster").click(function(){
	    Portal.toggleCluster();
	});
	$("#show_markers").click(function(){
	    Portal.toggleMarkers();
	});

}

google.maps.event.addDomListener(window, 'load', main);