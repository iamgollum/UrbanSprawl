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

	var portal = this; //put this object into scope for private members

    var countyStyle = [];
	for (var i = 0; i < nycounties.features.length; i++){

        var color = '#'+Math.floor(Math.random()*16777215).toString(16);
		var style = {
			strokeColor: "#444",
			strokeOpacity: 1,
			strokeWeight: 2,
			fillColor: color,
			fillOpacity: 1		
		};
		console.log(color);
		countyStyle.push(style);
	}

	// ************************************************************************ 
	// PUBLIC PROPERTIES -- ANYONE MAY READ/WRITE 
	// ************************************************************************
	this.set('map', new google.maps.Map(document.getElementById('sprawl-map'), options) );
	
	this.styles = map_styles; 
	this.themeStrategy = map_styles['water'];
	this.infoBox = $("#info");

	this.markers = {};
	this.currentDataSet = {};
	this.markersNumSelected = 0;

    this.MarkerCluster = null;
    this.cluster_on = false;    
    this.markers_on = true;

    this.countyInfoWindow = new google.maps.InfoWindow();
    this.currentFeature_or_Features = null;
    this.geoJSON_On = true;

    this.histogram = $('#histogram');
    this.pointCompositeContainer = null;
    this.pointParentElement = null;
    this.histogram.empty();
 

	/* Bind theme strategies with map */
	for (key in this.styles){this.styles[key].bindTo('map', this);}

	this.overlays = {
		'bikeroute' : new google.maps.BicyclingLayer(),
		'transit' : new google.maps.TransitLayer(),
		'counties' : new function(){},
	}

    this.heatmap = new HeatmapOverlay(this.get('map'), {
        "radius":20,
        "visible":true, 
        "opacity":60
    });

 	// ************************************************************************ 
	// PRIVATE VARIABLES FROM PUBLIC VARIABLES
	// ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE 
	// ***********************************************************************
	var themap = this.get('map');

    /* Update Lat and Long */
    (function(portal, themap) {
	    google.maps.event.addListener(themap,'center_changed', function(e) {
	    	window.setTimeout(function() {
	      		portal.infoBox.html(themap.getCenter().lat().toPrecision(8) + ", " + themap.getCenter().lng().toPrecision(6));
	    	}, 200);
	    });
	})(portal, themap);


 	// ************************************************************************ 
	// PRIVATE FUNCTIONS 
	// ONLY PRIVELEGED METHODS MAY VIEW/EDIT/INVOKE 
	// ************************************************************************

	var compareMarkers = function(a,b) {
	  if (a.kind < b.kind)
	     return -1;
	  if (a.kind > b.kind)
	    return 1;
	  return 0;
	}

	var loadNewYorkData_ = function(){

		// Set up county overlay by default
		var state = nycounties.properties.kind;
		portal.showGeoJSON_Feature(nycounties, this.countyInfoWindow, countyStyle);
		currentFeature_or_Features = portal.currentFeature_or_Features;

		if(!currentFeature_or_Features) { alert("initialize portal.currentFeature_or_Features first"); return; }
		
		currentFeature_or_Features = portal.currentFeature_or_Features;
		featureLength = currentFeature_or_Features.length;

		if (currentFeature_or_Features.type && currentFeature_or_Features.type == "Error"){
			alert(currentFeature_or_Features.message);
			return;
		}

		if (featureLength){
			
			for (var i = 0; i < featureLength; i++){
				if(currentFeature_or_Features[i].length){
					currentFeature_or_Features[i].fillOpacity = 1;
					for(var j = 0; j < currentFeature_or_Features[i].length; j++){
						if(currentFeature_or_Features[i][j].geojsonProperties) {		
							// init markers
							var center = new google.maps.LatLng(
								currentFeature_or_Features[i][j].geojsonProperties['center'][1],
								currentFeature_or_Features[i][j].geojsonProperties['center'][0]);
							var countyname = currentFeature_or_Features[i][j].geojsonProperties['name'];
						    var statename = currentFeature_or_Features[i][j].geojsonProperties['state'];
							var county = currentFeature_or_Features[i][j].geojsonProperties['kind'];

							//.setStyle({"fillOpacity: 1"});


						    var marker = new google.maps.Marker({ //markers for this dataset are county level
						    	id: i,
						        position: center,
						        map: themap,
								icon: 'img/small_red.png',
								selected: false,
								visible: true,
						        title: countyname + " " + county, //ie. Albany County
						        root: state,                      //ie. State
						        parent: statename,                //ie. NY
						        kind: county,                     //ie. County
						        kindTotal: featureLength,         //ie. 62
						        name: countyname,                 //ie. Albany
								kindDomElement: new CharacteristicMultiSelect(countyname.capitalize(), countyname, 6, 6)
						    });

						     //process multiple info windows
						    (function(marker, i, portal) {
						        // add click event
						        google.maps.event.addListener(marker, 'click', function(event) {
						        	if(!marker.selected){
						        		portal.markersNumSelected+=1;
						        		marker.selected = true;
						        		marker.setIcon('img/small_yellow.png');
										portal.pointCompositeContainer.add(marker.kindDomElement);
						        	} else {
						        		portal.markersNumSelected-=1;
						        		marker.selected = false;
						        		marker.setIcon('img/small_red.png');
						        		portal.pointCompositeContainer.remove(marker.kindDomElement);
						        	}
						        	portal.pointParentElement.setMeter(portal.markersNumSelected);
								    portal.infoBox.html("Selected: " + portal.markersNumSelected);
						        });
						       portal.markers[marker.name] = marker;
						    })(marker, i, portal);
		  
						}
					}
				}
			}
		}
	
	//portal.markers.sort(compareMarkers);
	}

	var enableBoxSelection_ = function(){

		portal.mouseDownPos = null;
		portal.gribBoundingBox = null;
		portal.mouseIsDown = 0,
		portal.selecting = false;
		portal.shiftPressed = false;


		$(window).keydown(function (evt) {
		    if (evt.which === 16) { // shift
		        portal.shiftPressed = true;
		        portal.clearGeoJSON();
		    }
		}).keyup(function (evt) {
		    if (evt.which === 16) { // shift
		        portal.shiftPressed = false;
		    }
		});

		/* Box Selection Toolbar */
		$("#box-select").click(function(){
		    portal.selecting = true;
		    $(this).css("color","#FFFFFF");
		    if(!this.geoJSON_On) {portal.clearGeoJSON();}
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
		    	$("#box-select").css("color","#000000");
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
		        var markersNumSelected = portal.markersNumSelected;
		        if (portal.gribBoundingBox !== null) // box exists
		        {
		            var boundsSelectionArea = new google.maps.LatLngBounds(portal.gribBoundingBox.getBounds().getSouthWest(), portal.gribBoundingBox.getBounds().getNorthEast());

			            for (var key in portal.markers) { // looping through my Markers Collection 
			            	
			            	// In selected area?
			            	var current_marker = portal.markers[key];
		            		
							if (portal.gribBoundingBox.getBounds().contains(current_marker.getPosition())) 
							{
								current_marker.setIcon('img/small_yellow.png');
					        	if(!current_marker.selected){
					        		markersNumSelected+=1;
					        		current_marker.selected = true;
					        		portal.pointCompositeContainer.add(current_marker.kindDomElement);
					        	}

							} else {

								//current_marker.setIcon('img/small_red.png');
								//current_marker.selected = false;
							}
			            }

		            portal.gribBoundingBox.setMap(null); // remove the rectangle

		        }
		        portal.gribBoundingBox = null;
		        portal.selecting = false;
		        portal.pointParentElement.setMeter(markersNumSelected);
				portal.infoBox.html("Selected: " + markersNumSelected);
		        portal.markersNumSelected = markersNumSelected;
		        $("#box-select").css("color","#FFFFFF");
		    }

		    themap.setOptions({
		        draggable: true
		    });
		    if(portal.geoJSON_On) {portal.showGeoJSON();}
		});

	}

	var enablePlacesSearch_ = function(){
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
		(function(searchBox) {
			google.maps.event.addListener(themap, 'bounds_changed', function() {
				var bounds = themap.getBounds();
				searchBox.setBounds(bounds);
			});
		})(searchBox);
	}

	var initializeHistogram_ = function(){
	/* 
	   THIS IS A HARD CODE FOR THE HISTOGRAM 
	   ONLY DYNAMIC COMPONENT ARE THE COUNTIES

	   IF PORTAL HAD ACCESS TO MORE DATA THEN THIS FUNCTION CAN BE MORE DYNAMIC
	*/
	var States = null;
	var Counties = null;
	var NYCounties = null;
	//Normally this would be generated from the union for characteristics from all points and fill an array
	var data = ['Population', 'Housing', 'Information', 'Health', 'Educational', 'RetailTrade']
	//this.markers.sort(dynamicSortMultiple("kind", "selected"));


	var setRootView = function(){
		m = portal.markers['Albany']; //hard code
		States = new HistogramComposite(m.root.capitalize(), m.root);
		Counties = new HistogramComposite(m.kind.capitalize(), m.kind);
		NYCounties = new HistogramComposite(m.parent.toUpperCase(), m.parent);
		
		//Essential for point selection
		portal.pointCompositeContainer = NYCounties;

		var NewYork = new CharacteristicStandard(m.parent.toUpperCase(), 
												0, 
												m.kindTotal);
		portal.pointParentElement = NewYork;
		States.getContainer().appendTo('#histogram');
		States.add(NewYork);
		States.contains(Counties);
		Counties.add(NYCounties)
		/* Not driven by data*/
	}

	var setCharacteristicView = function(){
		var Characteristics = new HistogramComposite('Characteristic', 'data');
		for (var title = 0; title < data.length; title++) {
			var ch = new CharacteristicWithDataView(data[title]);
			Characteristics.add(ch);
		}
		Counties.contains(Characteristics);
	}

	setRootView();
	setCharacteristicView();	
	States.show();

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
		portal.clearGeoJSON(infowindow);
		portal.currentFeature_or_Features = new GeoJSON(geojson, style || null);
		currentFeature_or_Features = portal.currentFeature_or_Features;
		featureLength = currentFeature_or_Features.length;

		if (currentFeature_or_Features.type && currentFeature_or_Features.type == "Error"){
			alert(currentFeature_or_Features.message);
			return;
		}
		if (featureLength){
			for (var i = 0; i < featureLength; i++){
				if(currentFeature_or_Features[i].length){
					for(var j = 0; j < currentFeature_or_Features[i].length; j++){
						currentFeature_or_Features[i][j].setMap(themap);
						if(currentFeature_or_Features[i][j].geojsonProperties) {
							this.setInfoWindow(currentFeature_or_Features[i][j]);
						}
					}
				}
				else{
					currentFeature_or_Features[i].setMap(themap);
				}
				if (currentFeature_or_Features[i].geojsonProperties) {
					this.setInfoWindow(currentFeature_or_Features[i]);
				}
			}
		}else{
			currentFeature_or_Features.setMap(themap)
			if (currentFeature_or_Features.geojsonProperties) {
				this.setInfoWindow(currentFeature_or_Features);
			}
		}
		
		// console.log(JSON.stringify(geojson));
	}

	this.setInfoWindow = function(feature) {
		var infowindow = portal.countyInfoWindow;
/*		google.maps.event.addListener(feature, "hover", function(event) {
			var content = "<div id='infoBox'><strong>";
			content += this.geojsonProperties['name'] + " " + this.geojsonProperties['kind'];
			
			for (var j in this.geojsonProperties) {
				content += j + ": " + this.geojsonProperties[j] + "<br />";
			}
			
			content += "</strong><br></div>";
			infowindow.setContent(content);
			infowindow.setPosition(event.latLng);
			infowindow.open(themap);
		});*/
	}

	this.clearGeoJSON = function(){
		infowindow = portal.countyInfoWindow;
		currentFeature_or_Features = portal.currentFeature_or_Features;
		if (!currentFeature_or_Features)
			return;

		featureLength = currentFeature_or_Features.length;
		if (featureLength){
			for (var i = 0; i < featureLength; i++){
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

	this.showGeoJSON = function(){
		infowindow = portal.countyInfoWindow;
		currentFeature_or_Features = portal.currentFeature_or_Features;
		if (!currentFeature_or_Features)
			return;

		featureLength = currentFeature_or_Features.length;
		if (featureLength){
			for (var i = 0; i < featureLength; i++){
				if(currentFeature_or_Features[i].length){
					for(var j = 0; j < currentFeature_or_Features[i].length; j++){
						currentFeature_or_Features[i][j].setMap(this.get('map'));
					}
				}
				else{
					currentFeature_or_Features[i].setMap(this.get('map'));
				}
			}
		}else{
			currentFeature_or_Features.setMap(this.get('map'));
		}
		if (infowindow.getMap()){
			infowindow.open();
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
	initializeHistogram_();

	/* Events */
	enableBoxSelection_();
	enablePlacesSearch_();
}
UrbanSprawlPortal.prototype = new google.maps.MVCObject();



// ************************************************************************ 
// PUBLIC METHODS -- ANYONE MAY READ/WRITE 
// ************************************************************************
UrbanSprawlPortal.prototype.invertSelection = function(){

	for (var key in this.markers) {
		var marker = this.markers[key];
		if(marker.selected){
			marker.setIcon('img/small_red.png');
			marker.selected = false;
			this.pointCompositeContainer.remove(marker.kindDomElement);
		} else{
			marker.setIcon('img/small_yellow.png');
			marker.selected = true;
			this.pointCompositeContainer.add(marker.kindDomElement);

		}
	}
	this.markersNumSelected = (Object.keys(this.markers).length - this.markersNumSelected);
	this.pointParentElement.setMeter(this.markersNumSelected);
	this.infoBox.html("Selected: " + this.markersNumSelected);
}

UrbanSprawlPortal.prototype.clearSelection = function(){
	for (var key in this.markers) {
		    var marker = this.markers[key];
			marker.setIcon('img/small_red.png');
			marker.selected = false;
			this.pointCompositeContainer.remove(marker.kindDomElement);
	}
	this.markersNumSelected = 0;
	this.pointParentElement.setMeter(this.markersNumSelected);
	var e = (this.heatmap) ? this.heatmap.heatmap.clear() : null;
	$('#slider').empty();
	$('#chart').empty();
	this.infoBox.html("Portal Cleared!");
}

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
  	this.markerCluster.setMap(null);
  	/*
  	this.markerCluster.clearMarkers();
  	this.markerCluster = null;
    for (var i = 0, marker; marker = this.markers[i]; i++) {
      marker.setMap(this.get('map'));
      marker.setVisible(true);
    }*/
    this.cluster_on = false;
    
  }

}

UrbanSprawlPortal.prototype.toggleOverlay = function(index, on){
	if (index == "counties"){
		if(!on){
			this.clearGeoJSON();
			this.geoJSON_On = false;
		} else{
			this.showGeoJSON();
			this.geoJSON_On = true;
		}
		return;
	}
	this.overlays[index].setMap(this.overlays[index].getMap() ? null : this.get('map'));
}

UrbanSprawlPortal.prototype.toggleMarkers = function(){
    for (var key in this.markers) {
     marker = this.markers[key];
      marker.setMap((this.markers_on) ? null : this.get('map'));
    }
    this.markers_on = (this.markers_on) ? false : true;
}


function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

UrbanSprawlPortal.prototype.applyDataSet = function(dataset){

	data = window[dataset];
	//parse RDF JSON Data
	var header = data.head.vars; //object, subject, no predicate
	var results = data.results.bindings;

	
	this.currentDataSet = {};
	for (var i = 0; i < results.length; i++) {
		//create hashtable of object : subject for fast lookup
		var sub = results[i][header[0]].value;
		var data = results[i][header[1]].value;
		this.currentDataSet[sub] = data;
	};
}

UrbanSprawlPortal.prototype.newHeatMap = function(dataset){

	if(this.markersNumSelected < 1){

		var e = (this.heatmap) ? this.heatmap.heatmap.clear() : null;
		$('#portal-title').html('');
		return;
	}
	$("#graph-overlay").slideUp("slow");
	$('#portal-title').html("Analyzing " + dataset + " Heatmap");

	var self = this;
	var heatmapData = [];
	var totalAmount, max = 0;
	var totals = [];

	this.applyDataSet(dataset);

	for (key in this.currentDataSet) {

		var amount = parseInt(this.currentDataSet[key].replace(/[^\d\.\-\ ]/g, ''));
		totalAmount += amount;
		totals[key] = amount;
		max = (max < amount) ? amount : max;
	}

	var bounds = new google.maps.LatLngBounds();
	$("#histogram input:checked").each(function () {
		//subjectClass == county
		var subject = $(this).attr("id");
		var marker = self.markers[subject];
		if (subject in totals){
			var weightedLoc = {
			  lat: marker.getPosition().lat(),
			  lng: marker.getPosition().lng(),
			  count: totals[subject]
			};
			heatmapData.push(weightedLoc); 
			bounds.extend(marker.getPosition());
	    }	        
    });
    // here is our dataset
    // important: a datapoint now contains lat, lng and count property!
    var weightedData={
            max: max,
            data: heatmapData
    };
    // now we can set the data
    google.maps.event.addListenerOnce(this.get('map'), "idle", function(){
        // this is important, because if you set the data set too early, the latlng/pixel projection doesn't work
        self.heatmap.setDataSet(weightedData);
    });

/*    this.map.fitBounds(bounds);*/
    this.map.setCenter(new google.maps.LatLng(42.792025, -75.435944));
}

UrbanSprawlPortal.prototype.loadDashboard = function(dataset){

	this.applyDataSet(dataset);

	var self = this;

	if(this.markersNumSelected < 1){
		$('#slider').empty();
		$('#chart').empty();
		$('#portal-title').html('');
		return;
	}

	$('#portal-title').html("Analyzing " + dataset + " Charts");
	$("#graph-overlay").slideDown("slow");

	var datatable = new google.visualization.DataTable();
	datatable.addColumn('string', 'Year'); 
	datatable.addRows(2);
    datatable.setCell(0, 0, '2000');
    datatable.setCell(1, 0, '2010');

	$("#histogram input:checked").each(function () {
		var subject = $(this).attr("id");

		if (subject in self.currentDataSet){
	        var colIndex = datatable.addColumn( 'number', $(this).attr("id"));
	        var amount = parseInt(self.currentDataSet[subject].replace(/[^\d\.\-\ ]/g, ''));
	        datatable.setCell(0, colIndex, amount);
	        datatable.setCell(1, colIndex, Math.ceil(amount - (Math.random()*(amount/2)) )) ;
    	}

    });

    /*
function disposeShit()
{
    chart.visualization.clearChart();
    control.visualization.dispose();
   dashboard.dispose();
}

    */

  // Define a category picker for the 'Metric' column.
  var categoryPicker = new google.visualization.ControlWrapper({
    'controlType': 'CategoryFilter',
    'containerId': 'slider',
    'options': {
      'filterColumnLabel': 'Year',
      'ui': {
        'allowTyping': false,
        'allowMultiple': true,
        'selectedValuesLayout': 'belowStacked',
      }
    },
    // Define an initial state, i.e. a set of metrics to be initially selected.
    'state': {'selectedValues': ['2000']}
  });

  // Define a column chart
  	var columnchart = new google.visualization.ChartWrapper({
	    'chartType': 'ColumnChart',
	    'containerId': 'chart',
	    'options': {
	      'title': dataset + ' Trends',
	      'hAxis': {title: 'Year', titleTextStyle: {color: 'red'}},
	      'width': 1400,
	      'height': 600,
	      'chartArea': {
/*	      	'width' : '100%',
	      	'height' : 600,*/
	      },
	      'bar': {groupWidth: "60%"},
	    }
	});
    // Create the dashboard.
  	var dashboard = new google.visualization.Dashboard(document.getElementById('graph-overlay')).
    // Configure the slider to affect the piechart
    bind(categoryPicker, columnchart).
    // Draw the dashboard
    draw(datatable);
}






var loadDistanceWidget = function(){
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

var getJsonFromUrl = function(url){
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
