
var urbanTheme = [
	{
		"stylers": [
			{
				"saturation": -100
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [
			{
				"lightness": -30
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "labels",
		"stylers": [
			{
				"invert_lightness": true
			},
			{
				"lightness": 30
			}
		]
	},
	{
		"featureType": "road",
		"stylers": [
			{
				"lightness": 15
			}
		]
	},
	{
		"featureType": "poi.park",
		"elementType": "geometry",
		"stylers": [
			{
				"lightness": 25
			}
		]
	},
	{
		"featureType": "landscape.natural.terrain",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	}
]

var transitTheme = [
	{
		"stylers": [
			{
				"visibility": "simplified"
				/* Remove strokes around map */
			}
		]
	},
	{
		"elementType": "labels",
		"stylers": [
			{
				"visibility": "off"
				/*remove text and other text shit on map*/
			}
		]
	},
	{
		"featureType": "landscape",
		"elementType": "geometry",
		"stylers": [
			{
				"lightness": 20
			}
		]
	},
	{
		"featureType": "landscape.natural.terrain",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "road",
		"elementType": "geometry",
		"stylers": [
			{
				"lightness": -10 /* make them lighter*/
			},
			{
				"visibility": "on" /*not in simplified mode*/
			}
		]
	},
	{
		"featureType": "poi.park",
		"elementType": "geometry",
		"stylers": [
			{
				"lightness": 25
			}
		]
	}
]

var waterTheme = [
	{
		"stylers": [
			{
				"visibility": "off"
				/* Remove strokes around map */
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#cccccc"
			},
			{
				"visibility": "on" 
			}
		]
	},
	{
		"featureType": "landscape",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#000000"
			},
			{
				"visibility": "on"
			}
		]
	},
	{
		"featureType": "road", /*Turned roads back on as it gives better impression for water bodies*/
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#000000"
			},
			{
				"visibility": "on"
			}
		]
	},
	{
		"featureType": "administrative",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"color": "#ffffff"
			},
		]
	},
	{
		"featureType": "administrative",
		"elementType": "labels.text.stroke",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"color": "#333333"
			},
		]
	},
	{
		"featureType": "water",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"color": "#ffffff"
			},
		]
	},
]

var inverseWaterTheme = [
	{
		"stylers": [
			{
				"visibility": "off"
				/* Remove strokes around map */
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#000000"
			},
			{
				"visibility": "on" 
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "labels.text.stroke",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"color": "#333333"
			},
		]
	},
	{
		"featureType": "water",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"color": "#cccccc"
			},
		]
	},
	{
		"featureType": "landscape",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#333333"
			},
			{
				"visibility": "on"
			}
		]
	},
	{
		"featureType": "road", /*Turned roads back on as it gives better impression for water bodies*/
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#000000"
			},
			{
				"visibility": "on"
			}
		]
	},
	{
		"featureType": "administrative.country",
		"elementType": "labels",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"invert_lightness": true
			},
		]
	},
	{
		"featureType": "administrative.locality",
		"elementType": "labels",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"invert_lightness": true
			},
		]
	},
	{
		"featureType": "administrative.country",
		"elementType": "geometry.stroke",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"lightness": -40
			},
			{
				"weight": 1.5
			},
		]
	},
]


// We can also leverage the power of Prototypes in Javascript to create
// classes that act as strategies.
//
// Here, we create an abstract class that will serve as the interface
// for all our strategies. It isn't needed, but it's good for documenting
// purposes.
var MapStrategy = function() {};
MapStrategy.prototype = new google.maps.MVCObject();
 
MapStrategy.prototype.execute = function() {
  throw new Error('MapStrategy#execute needs to be overridden.')
};
 
// Like above, we want to create Greeting strategies. Let's subclass
// our Strategy class to define them. Notice that the parent class
// requires its children to override the execute method.
var MapThemeStrategy = function() {};
MapThemeStrategy.prototype = Object.create(MapStrategy.prototype);
 
// Here is the `execute` method, which is part of the public interface of
// our Strategy-based objects. Notice how I implemented this method in term of
// of other methods. This pattern is called a Template Method, and you'll see
// the benefits later on.
MapThemeStrategy.prototype.execute = function(map) {
  this.setTheme(map);
  //add other methods to enhance the template effect
};

 
MapThemeStrategy.prototype.setTheme = function(map) {
  map.setOptions({styles: urbanTheme}); /* default theme */
};
 
// Since the GreetingStrategy#execute method uses methods to define its algorithm,
// the Template Method pattern, we can subclass it and simply override one of those
// methods to alter the behavior without changing the algorithm.
 
var UrbanTheme = function() {};
UrbanTheme.prototype = Object.create(MapThemeStrategy.prototype);

var TransitTheme = function() {};
TransitTheme.prototype = Object.create(MapThemeStrategy.prototype);
TransitTheme.prototype.setTheme = function(map) {
  map.setOptions({styles: transitTheme}); /* default theme */
};
 
var WaterTheme = function() {};
WaterTheme.prototype = Object.create(MapThemeStrategy.prototype);
WaterTheme.prototype.setTheme = function(map) {
  map.setOptions({styles: waterTheme}); /* default theme */
};
 
var InverseWaterTheme = function() {};
InverseWaterTheme.prototype = Object.create(MapThemeStrategy.prototype);
InverseWaterTheme.prototype.setTheme = function(map) {
  map.setOptions({styles: inverseWaterTheme}); /* default theme */
};