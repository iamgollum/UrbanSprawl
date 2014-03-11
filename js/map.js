var distanceWidget;
var map;
var geocodeTimer;
var profileMarkers = [];

var urbanSprawlPortal = function(opt_options){
	this.options = opt_options || {};
	this.map =   map = new google.maps.Map(
		document.getElementById('sprawl-map'), 
		{
	    center: new google.maps.LatLng(37.790234970864, -122.39031314844),
	    zoom: 8,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  	}
	  );
}


function init() {
  var mapDiv = document.getElementById('sprawl-map');
  map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(37.790234970864, -122.39031314844),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

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

function updatePosition() {
  if (geocodeTimer) {
    window.clearTimeout(geocodeTimer);
  }

  // Throttle the geo query so we don't hit the limit
  geocodeTimer = window.setTimeout(function() {
    reverseGeocodePosition();
  }, 200);
}

function reverseGeocodePosition() {
  var pos = distanceWidget.get('position');
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'latLng': pos}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        $('#of').html('of ' + results[1].formatted_address);
        return;
      }
    }

    $('#of').html('of somewhere');
  });
}

function updateDistance() {
  var distance = distanceWidget.get('distance');
  $('#dist').html(distance.toFixed(2));
}

function addActions() {
  var s = $('#s').submit(search);

/*  $('#close').click(function() {
    $('#cols').removeClass('has-cols');
    google.maps.event.trigger(map, 'resize');
    map.fitBounds(distanceWidget.get('bounds'));
    $('#results-wrapper').hide();

    return false;
  });*/
}

function search(e) {
  e.preventDefault();
  var q = $('#q').val();
  if (q == '') {
    return false;
  }

  var d = distanceWidget.get('distance');
  var p = distanceWidget.get('position');

/*  var url = 'http://search.twitter.com/search.json?callback=addResults' +
    '&rrp=100&q=' + escape(q) + '&geocode=' + escape(p.lat() + ',' + p.lng() +
    ',' + d + 'km');

  clearMarkers();

  $.getScript(url);

  $('#results').html('Searching...');
  var cols = $('#cols');
  if (!cols.hasClass('has-cols')) {
    $('#cols').addClass('has-cols');
    google.maps.event.trigger(map, 'resize');
    map.fitBounds(distanceWidget.get('bounds'));
  }*/
}

function clearMarkers() {
  for (var i = 0, marker; marker = profileMarkers[i]; i++) {
    marker.setMap(null);
  }



}

google.maps.event.addDomListener(window, 'load', init);