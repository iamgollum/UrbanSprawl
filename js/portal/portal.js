/**
 * A singelton instance of the Urban Sprawl Assessment Portal.
 * 
 *
 * @param {Object} opt_options Options such as map, position etc.
 * @param {Object} map_styles Map feature and overlay stylings
 *
 * @constructor
 */
 var UrbanSprawlPortal = function (map_options, map_styles){

 	// ************************************************************************ 
	// PRIVATE VARIABLES
	// ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE 
	// ***********************************************************************
	var options = map_options || {};

	var countyStyle = {
		strokeColor: "red",
		strokeOpacity: 1,
		strokeWeight: 2,
		fillColor: "#FFFFFF",
		fillOpacity: 0		
	}

	// ************************************************************************ 
	// PUBLIC PROPERTIES -- ANYONE MAY READ/WRITE 
	// ************************************************************************
	this.set('map', new google.maps.Map(document.getElementById('sprawl-map'), options) );
	
	this.styles = map_styles; 
	this.themeStrategy = map_styles['water'];
	this.infoBox = $("#info");

	this.markers = [];
	this.selectedMarkers = [];
	this.weightedLocations = [];

    this.MarkerCluster = null;
    this.cluster_on = false;    
    this.markers_on = true;

	this.overlays = {
		'bikeroute' : new google.maps.BicyclingLayer(),
		'transit' : new google.maps.TransitLayer(),
		'counties' : new function(){},
	}

	/* Bind theme strategies with map */
	for (key in this.styles){this.styles[key].bindTo('map', this);}

    /* Update Lat and Long */
    themap = this.get('map');
    google.maps.event.addListener(themap,'center_changed', function(e) {
    	window.setTimeout(function() {
      		$("#info").html(themap.getCenter().lat().toPrecision(8) + ", " + themap.getCenter().lng().toPrecision(6));
    	}, 200);
    });


 	// ************************************************************************ 
	// PRIVATE FUNCTIONS 
	// ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE 
	// ************************************************************************
	var loadNewYorkData_ = function(){

		var southWest = new google.maps.LatLng(42.102961, -79.164429);
		var northEast = new google.maps.LatLng(43.125695, -73.759155);
		var lngSpan = northEast.lng() - southWest.lng();
		var latSpan = northEast.lat() - southWest.lat();
		portal = this
		selectedMarkers = this.selectedMarkers;

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

		     //process multiple info windows
		    (function(marker, i, selectedMarkers) {
		        // add click event
		        google.maps.event.addListener(marker, 'click', function(event) {
		        	marker.setIcon('img/small_yellow.png');
				    selectedMarkers.push(marker);
				    portal.infoBox.html("Selected: " + portal.selectedMarkers.length);
				    // some more code to change icon, add marker name to list, etc 
				    //   so user knows marker has been selected
		        });
		    })(marker, i, selectedMarkers);

		    var wloc = {
		    	location: marker.getPosition(), 
		    	weight: ((Math.random() + 1) * 100)
		    };
		    this.markers.push(marker);
		    this.weightedLocations.push(wloc);
		}
	}

	var enableBoxSelection_ = function(themap){

		var portal = this;
		portal.mouseDownPos = null;
		portal.gribBoundingBox = null;
		portal.mouseIsDown = 0,
		portal.selecting = false;
		portal.shiftPressed = false;


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
							portal.selectedMarkers[key] = portal.markers[key];

						} else {

							portal.markers[key].setIcon('img/small_red.png');
							portal.selectedMarkers.splice(key, 1);
						}
		            }

		            portal.gribBoundingBox.setMap(null); // remove the rectangle
		        }
		        portal.gribBoundingBox = null;
		        portal.selecting = false;
				portal.infoBox.html("Selected: " + portal.selectedMarkers.length + " Rem: " + (portal.markers.length - portal.selectedMarkers.length));
		        $("#box-select").css("color","#67676C");
		    }

		    themap.setOptions({
		        draggable: true
		    });
		});

	}

	var enablePlacesSearch_ = function(themap){
		var searchBox = new google.maps.places.SearchBox((document.getElementById('search-input')));

		place_markers = [];
		// [START region_getplaces]
		// Listen for the event fired when the user selects an item from the
		// pick list. Retrieve the matching places for that item.
		google.maps.event.addListener(searchBox, 'places_changed', function() {
			var places = searchBox.getPlaces();

			for (var i = 0, marker; marker = place_markers[i]; i++) {
			  marker.setMap(null);
			}

			// For each place, get the icon, place name, and location.
			place_markers = [];
			var bounds = new google.maps.LatLngBounds();
			for (var i = 0, place; place = places[i]; i++) {
			  var image = {
			    url: place.icon,
			    size: new google.maps.Size(71, 71),
			    origin: new google.maps.Point(0, 0),
			    anchor: new google.maps.Point(17, 34),
			    scaledSize: new google.maps.Size(25, 25)
			  };

			  // Create a marker for each place.
			  var marker = new google.maps.Marker({
			    map: themap,
			    icon: image,
			    title: place.name,
			    position: place.geometry.location
			  });

			  place_markers.push(marker);

			  bounds.extend(place.geometry.location);
			}

			themap.fitBounds(bounds);
		});
		// [END region_getplaces]

		// Bias the SearchBox results towards places that are within the bounds of the
		// current map's viewport.
		google.maps.event.addListener(themap, 'bounds_changed', function() {
			var bounds = themap.getBounds();
			searchBox.setBounds(bounds);
		});
	}

	// ************************************************************************ 
	// PRIVILEGED METHODS 
	// MAY BE INVOKED PUBLICLY AND MAY ACCESS PRIVATE ITEMS 
	// MAY NOT BE CHANGED; MAY BE REPLACED WITH PUBLIC FLAVORS 
	// ************************************************************************ 

	/**
	 * Loads a geoJSON overlay onto map 
	 * geoJSON object library found at https://github.com/JasonSanford/geojson-google-maps
	 *
	 * Supports the following geoJSON variations:
	 * - Point
	 * - MultiPoint
	 * - LineString
	 * - MultiLineString
	 * - Polygon
	 * - Plygon with Hole
	 * - MultiPolygon
	 * - Geometry Collection
	 * - Feature
	 * - Feature-Geometry Collection
	 * - Feature Collection
	 *
	 *
	 * @param {Object} geojson GeoJSON Object
	 * @param {Object} styles Stylings such as stroke, fill, opacity, etc...
	 *
	 * @constructor
	 */
	this.showGeoJSON_Feature = function(geojson, infowindow, style){
		clearGeoJSONMap(infowindow);
		currentFeature_or_Features = new GeoJSON(geojson, style || null);

		if (currentFeature_or_Features.type && currentFeature_or_Features.type == "Error"){
			alert(currentFeature_or_Features.message);
			return;
		}
		if (currentFeature_or_Features.length){
			for (var i = 0; i < currentFeature_or_Features.length; i++){
				if(currentFeature_or_Features[i].length){
					for(var j = 0; j < currentFeature_or_Features[i].length; j++){
						currentFeature_or_Features[i][j].setMap(map);
						if(currentFeature_or_Features[i][j].geojsonProperties) {
							this.setInfoWindow(currentFeature_or_Features[i][j]);
						}
					}
				}
				else{
					currentFeature_or_Features[i].setMap(map);
				}
				if (currentFeature_or_Features[i].geojsonProperties) {
					this.setInfoWindow(currentFeature_or_Features[i]);
				}
			}
		}else{
			currentFeature_or_Features.setMap(map)
			if (currentFeature_or_Features.geojsonProperties) {
				this.setInfoWindow(currentFeature_or_Features);
			}
		}
		
		// console.log(JSON.stringify(geojson));
	}

	this.setInfoWindow = function(feature, infowindow) {
		(function(infowindow) {
			google.maps.event.addListener(feature, "click", function(event) {
				var content = "<div id='infoBox'><strong>GeoJSON Feature Properties</strong><br />";
				for (var j in this.geojsonProperties) {
					content += j + ": " + this.geojsonProperties[j] + "<br />";
				}
				content += "</div>";
				infowindow.setContent(content);
				infowindow.setPosition(event.latLng);
				infowindow.open(map);
			});
		})(infowindow);
	}

	this.clearGeoJSON = function(infowindow){
		if (!currentFeature_or_Features)
			return;
		if (currentFeature_or_Features.length){
			for (var i = 0; i < currentFeature_or_Features.length; i++){
				if(currentFeature_or_Features[i].length){
					for(var j = 0; j < currentFeature_or_Features[i].length; j++){
						currentFeature_or_Features[i][j].setMap(null);
					}
				}
				else{
					currentFeature_or_Features[i].setMap(null);
				}
			}
		}else{
			currentFeature_or_Features.setMap(null);
		}
		if (infowindow.getMap()){
			infowindow.close();
		}
	}



 	// ************************************************************************ 
	// EXECUTE ALL PORTAL DEFAULT COMPONENTS, LAYERS, DATA, AND EVENTS
	// ************************************************************************

	/* Comonents */
    this.infoBox.html(themap.getCenter().lat().toPrecision(8) + ", " + themap.getCenter().lng().toPrecision(6))
	this.themeStrategy.execute();
	
	/* Data */
	loadNewYorkData_();

	/* Events */
	enableBoxSelection_(this.get('map'));
	enablePlacesSearch_(this.get('map'));
}
UrbanSprawlPortal.prototype = new google.maps.MVCObject();



// ************************************************************************ 
// PUBLIC METHODS -- ANYONE MAY READ/WRITE 
// ************************************************************************

UrbanSprawlPortal.prototype.changeMapStyle = function(index){
	this.styles[index].execute(this.get('map'));
	this.themeStrategy = this.styles[index];
}

UrbanSprawlPortal.prototype.toggleCluster = function(){
  
  if (!this.cluster_on) {
    this.markerCluster = new MarkerClusterer(this.get('map'), this.markers);
    this.cluster_on = true;
  } 
  else {
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
}

UrbanSprawlPortal.prototype.toggleMarkers = function(){
    for (var i = 0, marker; marker = this.markers[i]; i++) {
      marker.setMap((this.markers_on) ? null : this.get('map'));
    }
    this.markers_on = (this.markers_on) ? false : true;
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

  google.maps.event.addListener(distanceWidget, 'distance_changed', updateDistance);

  google.maps.event.addListener(distanceWidget, 'position_changed', updatePosition);

  map.fitBounds(distanceWidget.get('bounds'));

  updateDistance();
  updatePosition();
  addActions();
}

UrbanSprawlPortal.prototype.loadDashboard = function(data){

	var data = google.visualization.arrayToDataTable([
      ['Year', 'Albany', 'Bronx', 'Allegany'],
      [new Date(2004, 6, 13),  1000,      400,    780],
      [new Date(2005, 6, 13),  1170,      460,    510],
      [new Date(2006, 6, 13),  660,       1120,   350],
      [new Date(2007, 6, 13),  1030,      540,    230]
    ]);

	  // Define a slider control for the 'Donuts eaten' column
	  var slider = new google.visualization.ControlWrapper({
	    'controlType': 'DateRangeFilter',
	    'containerId': 'slider',
	    'options': {
	      'filterColumnLabel': 'Year',
	      'ui': {'labelStacking': 'vertical', 'format': { 'pattern': 'yyyy' }},
	    }
	  });

  // Define a pie chart
  	var columnchart = new google.visualization.ChartWrapper({
	    'chartType': 'ColumnChart',
	    'containerId': 'chart',
	    'options': {
	      'title': 'Population Trends',
	      'hAxis': {title: 'Year', titleTextStyle: {color: 'red'}},
	      'width': 800,
	      'height': 500
	    }
	});
    // Create the dashboard.
  	var dashboard = new google.visualization.Dashboard(document.getElementById('graph-overlay')).
    // Configure the slider to affect the piechart
    bind(slider, columnchart).
    // Draw the dashboard
    draw(data);
}

UrbanSprawlPortal.prototype.getJsonFromUrl = function(url){
    var json_data = [];
	var jqxhr = $.getJSON(url, function(json) {
	  console.log( "success" );
	  json_data = json
	})
	.done(function() {
		console.log( "second success" );
	})
	.fail(function() {
		console.log( "error" );
	})
	.always(function() {
		console.log( "complete" );
	});

	return json_data;
}
