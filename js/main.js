
$(function() {
  // Handler for .ready() called.

function initialize() {
    var center = new google.maps.LatLng(42.792025, -75.435944);

    var map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 6,
      center: center,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
	  mapTypeControl: false,
      zoomControl:false
    });

    var markers = [];

     // NY and CA sample Lat / Lng
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
	        title: 'Click Me ' + i,
			icon: {
			  path: google.maps.SymbolPath.CIRCLE,
			  scale: 2,
			},
	    });

	    // process multiple info windows
	    (function(marker, i) {
	        // add click event
	        google.maps.event.addListener(marker, 'click', function() {
	            infowindow = new google.maps.InfoWindow({
	                content: 'Hello, World!!'
	            });
	            infowindow.open(map, marker);
	        });
	    })(marker, i);

	    markers.push(marker);
	}

    var markerCluster = new MarkerClusterer(map, markers);

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

google.maps.event.addListener(map, 'mousemove', function (e) {
   if (mouseIsDown && (shiftPressed|| gribBoundingBox != null) ) {
        if (gribBoundingBox !== null) // box exists
        {         
           var newbounds = new google.maps.LatLngBounds(mouseDownPos,null);
           newbounds.extend(e.latLng);    
           gribBoundingBox.setBounds(newbounds); // If this statement is enabled, I lose mouseUp events

        } else // create bounding box
        {
            gribBoundingBox = new google.maps.Rectangle({
                map: map,
                bounds: null,
                fillOpacity: 0.15,
                strokeWeight: 0.9,
                clickable: false
            });
        }
    }
});

    google.maps.event.addListener(map, 'mousedown', function (e) {
        if (shiftPressed) {

            mouseIsDown = 1;
            mouseDownPos = e.latLng;
            map.setOptions({
                draggable: false
            });
        }
    });

    google.maps.event.addListener(map, 'mouseup', function (e) {
		if (mouseIsDown && (shiftPressed|| gribBoundingBox != null)) {
		    mouseIsDown = 0;
            if (gribBoundingBox !== null) // box exists
            {
                var boundsSelectionArea = new google.maps.LatLngBounds(gribBoundingBox.getBounds().getSouthWest(), gribBoundingBox.getBounds().getNorthEast());
                
                for (var key in markers) { // looping through my Markers Collection	

//                    if (boundsSelectionArea.contains(markers[key].marker.getPosition())) 
                    if (gribBoundingBox.getBounds().contains(markers[key].marker.getPosition())) 
                    {
                        //if(flashMovie !== null && flashMovie !== undefined) {
                        markers[key].marker.setIcon("http://maps.google.com/mapfiles/ms/icons/blue.png")
			document.getElementById('info').innerHTML += "key:"+key+" posn:"+markers[key].marker.getPosition()+" in bnds:"+gribBoundingBox.getBounds()+"<br>";
                        // console.log("User selected:" + key + ", id:" + markers[key].id);
                        //}   
                    } else {
                        //if(flashMovie !== null && flashMovie !== undefined) {
                        markers[key].marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red.png")
			document.getElementById('info').innerHTML += "key:"+key+" posn:"+markers[key].marker.getPosition()+" out of bnds:"+gribBoundingBox.getBounds()+"<br>";
                        // console.log("User NOT selected:" + key + ", id:" + markers[key].id);
                        //} 
                    }
                }

                gribBoundingBox.setMap(null); // remove the rectangle
            }
            gribBoundingBox = null;

        }

        map.setOptions({
            draggable: true
        });
        //stopDraw(e);
    });

  }/*Initialize*/



 	google.maps.event.addDomListener(window, 'load', initialize);
 
 });