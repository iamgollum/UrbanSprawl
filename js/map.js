/**
 * A singelton instance of the Urban Sprawl Assessment Portal.
 * 
 *
 * @param {Object} opt_options Options such as map, position etc.
 *
 * @constructor
 */
 var UrbanSprawlPortal = function (opt_options){
	var options = opt_options || {};
	
	this.map = new google.maps.Map(
		document.getElementById('sprawl-map'), 
		{
		center: new google.maps.LatLng(42.792025, -75.435944),
		zoom: 6,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		zoomControl:false,
		disableDefaultUI: true,
		styles: urbanTheme
	  	}
	  );

	this.infoBox = $("#info");
	this.markers = [];
	this.markerCluster = new MarkerClusterer(this.map);

    /* Update Lat and Long */
    themap = this.map
    google.maps.event.addListener(themap,'center_changed', function(e) {
    	window.setTimeout(function() {
      		$("#info").html(themap.getCenter().lat() + ", " + themap.getCenter().lng());
    	}, 200);
    });

	this.loadNewYorkData_();
	this.enableBoxSelection_();
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
	        map: this.map,
	        title: 'marker ' + i,
			icon: 'img/small_red.png',
			selected: false,
			state: 'Online',
			id: (i+1) 
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

	    this.markers.push(marker);
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

UrbanSprawlPortal.prototype.cluster = function(){

	this.markerCluster.addMarkers(this.markers);
	this.markerCluster.setIgnoreHidden(true);
}

UrbanSprawlPortal.prototype.heatmap = function(){

/*
// Unset all markers
var i = 0, l = markers.length;
for (i; i<l; i++) {
    markers[i].setMap(null)
}
markers = []; //remove from memory, reset

// Clears all clusters and markers from the clusterer.
markerClusterer.clearMarkers();
*/
	/*$.each(this.markers, function(k, v){
	    v.setVisible(false);
	});
	this.markerCluster.repaint();*/

  markerClusterer.getSize() ? markerClusterer.clearMarkers() : null;

  var pointArray = new google.maps.MVCArray(this.markers);

  this.heatmap = new google.maps.visualization.HeatmapLayer({
    data: pointArray
  });

  heatmap.setMap(this.map);
}

UrbanSprawlPortal.prototype.cluster = function(){

	var bikeLayer = new google.maps.BicyclingLayer();
	bikeLayer.setMap(this.map); /*setMap(null) to remove it.*/
}


UrbanSprawlPortal.prototype.clearOverlay = function(overlay){


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
	var Portal = new UrbanSprawlPortal();
}
google.maps.event.addDomListener(window, 'load', main);