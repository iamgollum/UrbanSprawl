
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