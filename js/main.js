
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

	// set multiple marker
	for (var i = 0; i < 250; i++) {

		// init markers
	    var marker = new google.maps.Marker({
	        position: new google.maps.LatLng(southWest.lat() + latSpan * Math.random(), southWest.lng() + lngSpan * Math.random()),
	        map: map,
	        title: 'Click Me ' + i,
			icon: {
			  path: google.maps.SymbolPath.CIRCLE,
			  scale: 2
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

/*    for (var i = 0; i < 100; i++) {
      var location = yourData.location[i];
      var latLng = new google.maps.LatLng(location.latitude,
          location.longitude);
      var marker = new google.maps.Marker({
        position: latLng
      });
      markers.push(marker);
    }*/
    var markerCluster = new MarkerClusterer(map, markers);

  }/*Initialize*/

  google.maps.event.addDomListener(window, 'load', initialize);
 
 });