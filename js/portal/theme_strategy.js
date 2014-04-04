
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
MapThemeStrategy.prototype.execute = function() {
  this.setTheme();
  //add other methods to enhance the template effect
};
MapThemeStrategy.prototype.setTheme = function() {
	throw new Error('MapStrategy#setTheme needs to be overridden.')
};

// Since the GreetingStrategy#execute method uses methods to define its algorithm,
// the Template Method pattern, we can subclass it and simply override one of those
// methods to alter the behavior without changing the algorithm.
 
var UrbanTheme = function() {};
UrbanTheme.prototype = Object.create(MapThemeStrategy.prototype);
UrbanTheme.prototype.setTheme = function() {
	if (this.get('map')) {
  		this.get('map').setOptions({styles: urbanTheme}); /* default theme */
	}
};

var TransitTheme = function() {};
TransitTheme.prototype = Object.create(MapThemeStrategy.prototype);
TransitTheme.prototype.setTheme = function() {
	if (this.get('map')) {
  		this.get('map').setOptions({styles: transitTheme}); /* default theme */
	}	
};
 
var WaterTheme = function() {};
WaterTheme.prototype = Object.create(MapThemeStrategy.prototype);
WaterTheme.prototype.setTheme = function() {
	if (this.get('map')) {
  		this.get('map').setOptions({styles: waterTheme}); /* default theme */
	}
};
 
var InverseWaterTheme = function() {};
InverseWaterTheme.prototype = Object.create(MapThemeStrategy.prototype);
InverseWaterTheme.prototype.setTheme = function() {
	if (this.get('map')) {
  		this.get('map').setOptions({styles: inverseWaterTheme}); /* default theme */
	}
};
