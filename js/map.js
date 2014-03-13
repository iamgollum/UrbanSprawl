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
	this.themeStrategy = map_styles['urban'];
	this.infoBox = $("#info");
	this.set('markers', []);
	this.weightedLocations = [];
	this.dataviews= {
		'points' : new PointData(),
		'cluster' : new ClusterData()
	};

	for (key in this.styles){
		this.styles[key].bindTo('map', this);
	}

	for (key in this.dataviews){
		this.dataviews[key].bindTo('data', this, 'markers');
		this.dataviews[key].bindTo('map', this);
	}

	this.overlays = {
		'bikeroute' : new google.maps.BicyclingLayer(),
		'heatmap' : new google.maps.visualization.HeatmapLayer(),
	}



	this.dataStrategy = this.dataviews['cluster'];
	this.overlayStrategy = this.overlays['heatmap'];


    /* Update Lat and Long */
    themap = this.map
    google.maps.event.addListener(themap,'center_changed', function(e) {
    	window.setTimeout(function() {
      		$("#info").html(themap.getCenter().lat() + ", " + themap.getCenter().lng());
    	}, 200);
    });

	this.themeStrategy.execute(this.map);
	this.loadNewYorkData_();
	this.enableBoxSelection_();
}
UrbanSprawlPortal.prototype = new google.maps.MVCObject();

UrbanSprawlPortal.prototype.changeMapStyle = function(index){
	this.styles[index].execute(this.map);
	this.themeStrategy = this.styles[index];
}

UrbanSprawlPortal.prototype.changeDataView = function(index){
	this.dataStrategy.removeOverlay();
	this.dataviews[index].execute(this.map, this.markers);
	this.dataStrategy = this.dataviews[index];
}

UrbanSprawlPortal.prototype.toggleOverlay = function(index){
	this.overlays[index].setMap(this.overlays[index].getMap() ? null : this.map);
	if (index == "heatmap"){
		this.overlays[index].setData(this.weightedLocations);
	}
}

UrbanSprawlPortal.prototype.loadNewYorkData_ = function(){

	var southWest = new google.maps.LatLng(42.102961, -79.164429);
	var northEast = new google.maps.LatLng(43.125695, -73.759155);
	var lngSpan = northEast.lng() - southWest.lng();
	var latSpan = northEast.lat() - southWest.lat();

	for (var i = 0; i < 500; i++) {
		// init markers
	    var marker = new google.maps.Marker({
	        position: new google.maps.LatLng(southWest.lat() + latSpan * Math.random(), southWest.lng() + lngSpan * Math.random()),
	        map: this.map,
	        title: 'marker ' + i,
			icon: 'img/small_red.png',
			selected: false,
			state: 'Online',
			id: (i+1),
			visible: false
	    });

	    // process multiple info windows
	    (function(marker, i) {
	        // add click event
	        google.maps.event.addListener(marker, 'click', function() {
	            infowindow = new google.maps.InfoWindow({
	                content: 'Marker Content'
	            });
	            infowindow.open(this.map, marker);
	        });
	    })(marker, i);
	    var wloc = {
	    	location: marker.getPosition(), 
	    	weight: ((Math.random() + 1) * 100)
	    };
	    this.markers.push(marker);
	    this.weightedLocations.push(wloc);
	}
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
	/* Data View Selection */
	$("#dataview > li > a").click(function(){
	    Portal.changeDataView($(this).attr('id'));
	});
	$('#overlays input[type=checkbox]').change(function() {
		console.log("triggered");
  		Portal.toggleOverlay($(this).attr('id'));
	});

}

google.maps.event.addDomListener(window, 'load', main);