$(document).ready(function () {


/*
NEED TO CREATE EVENTS ON DATA WINDOW ... ON HOVER ... HIGHLIGHT POINTS IN GROUP / HISTOGRAM
*/
	var map;
	var themap;
	var markers = [];
	var bounds = null;
	var selecting = false;
	var infoBox = $("#info");

	var redIcon = {
		path: google.maps.SymbolPath.CIRCLE,
		scale: 3,
		fillColor: "red",
		strokeColor: "red"
	}

	var blueIcon = {
		path: google.maps.SymbolPath.CIRCLE,
		scale: 3,
		fillColor: "blue",
		strokeColor: "blue"
	}

	$("#box-select").click(function(){
	    selecting = true;
	    $(this).css("color","white");
	});


	var center = new google.maps.LatLng(42.792025, -75.435944);

	map = new google.maps.Map(document.getElementById('map-canvas'), {
	  zoom: 6,
	  center: center,
	  mapTypeId: google.maps.MapTypeId.SATELLITE,
	  mapTypeControl: false,
	  zoomControl:false
	});

	infoBox.html(map.getCenter().lat() + ", " + map.getCenter().lat());

	 // NY sample Lat / Lng
	var southWest = new google.maps.LatLng(42.102961, -79.164429);
	var northEast = new google.maps.LatLng(43.125695, -73.759155);
	var lngSpan = northEast.lng() - southWest.lng();
	var latSpan = northEast.lat() - southWest.lat();

	/* http://jsfiddle.net/7ZxMA/6/ */

	// set multiple marker
	for (var i = 0; i < 250; i++) {

		// init markers
	    var marker = new google.maps.Marker({
	        position: new google.maps.LatLng(southWest.lat() + latSpan * Math.random(), southWest.lng() + lngSpan * Math.random()),
	        map: map,
	        title: 'marker ' + i,
			icon: redIcon,
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
	            infowindow.open(map, marker);
	        });
	    })(marker, i);

	    markers.push(marker);
	}

	var markerCluster = new MarkerClusterer(map, markers);



    /* Update Lat and Long */
    google.maps.event.addListener(map,'center_changed', function(e) {
    	setTimeout(function() {
      		infoBox.html(map.getCenter().lat() + ", " + map.getCenter().lat());
    	}, 600);

      });


	// Start drag rectangle to select markers !!!!!!!!!!!!!!!!
	var shiftPressed = false;

	$(window).keydown(function (evt) {
	    if (evt.which === 16) { // shift
	        shiftPressed = true;
	    }
	}).keyup(function (evt) {
	    if (evt.which === 16) { // shift
	        shiftPressed = false;
	    }
	});

	var mouseDownPos, gribBoundingBox = null,
	    mouseIsDown = 0;

	themap = map;


	 google.maps.event.addListener(themap, 'mousemove', function (e) {
	    if (mouseIsDown && (selecting || shiftPressed|| gribBoundingBox != null) ) {
	        if (gribBoundingBox !== null) // box exists
	        {         
	            var newbounds = new google.maps.LatLngBounds(mouseDownPos,null);
	            newbounds.extend(e.latLng);    
	            gribBoundingBox.setBounds(newbounds); // If this statement is enabled, I lose mouseUp events

	        } else // create bounding box
	        {
	            console.log("first move");
	            gribBoundingBox = new google.maps.Rectangle({
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
	    if (selecting || shiftPressed) {
	    	$("#box-select").css("color","white");
	        mouseIsDown = 1;
	        mouseDownPos = e.latLng;
	        themap.setOptions({
	            draggable: false
	        });
	    }
	});

	google.maps.event.addListener(themap, 'mouseup', function (e) {
	    if (mouseIsDown && (selecting || shiftPressed|| gribBoundingBox != null)) {
	        mouseIsDown = 0;
	        var markersNumSelected = 0;
	        if (gribBoundingBox !== null) // box exists
	        {
	            var boundsSelectionArea = new google.maps.LatLngBounds(gribBoundingBox.getBounds().getSouthWest(), gribBoundingBox.getBounds().getNorthEast());
	            
	            for (var key in markers) { // looping through my Markers Collection 

					//if (boundsSelectionArea.contains(markers[key].marker.getPosition())) 
					if (gribBoundingBox.getBounds().contains(markers[key].getPosition())) 
					{
					//if(flashMovie !== null && flashMovie !== undefined) {
						
						//$('#info').HTML( "key:"+key+" posn: "+markers[key].marker.getPosition()+" in bnds: "+gribBoundingBox.getBounds());
						// console.log("User selected:" + key + ", id:" + markers[key].id);
						
						markers[key].setIcon(redIcon)

						if (markers[key].getAnimation() != null) {
						markers[key].setAnimation(null);
						} else {
						markers[key].setAnimation(google.maps.Animation.BOUNCE);
						}

						markersNumSelected++;

					//}   
					} else {
					//if(flashMovie !== null && flashMovie !== undefined) {
						if (markers[key].getAnimation() != null) {
						markers[key].setAnimation(null);
						}

						markers[key].setIcon(blueIcon);
						//$('#info').HTML( "key:"+key+" posn: "+markers[key].marker.getPosition()+" out of bnds: "+gribBoundingBox.getBounds());
						// console.log("User NOT selected:" + key + ", id:" + markers[key].id);
					//} 
					}
	            }

	            gribBoundingBox.setMap(null); // remove the rectangle
	        }
	        gribBoundingBox = null;
	        selecting = false;
			$('#info').html("Markers selected: " + markersNumSelected + " not-selected: " + (markers.length - markersNumSelected));
	        $("#box-select").css("color","#67676C");
	    }

	    themap.setOptions({
	        draggable: true
	    });
	    //stopDraw(e);
	});


});