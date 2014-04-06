jQuery(function( $ ){

var HistogramComposite = function (heading, pheading, id) {
    this.children = [];
    this.parent = null;
     
    this.element = $('<li id="' + id + '" class="composite-characteristic"></li>')
    var heading = (pheading) ? (pheading + "&gt;&gt;" + heading) : heading;
    this.element.append('<h2>' + heading + '</h2>');
}
 
HistogramComposite.prototype = {
    add: function (child) {
        this.children.push(child);
        this.element.append(child.getElement());
        child.setParent(this);
    },

    contains: function (child) {
        this.children.push(child);
        child.setParent(this);
    },
     
    remove: function (child) {    
        for (var node, i = 0; node = this.getChild(i); i++) {
            if (node == child) {
                this.children.splice(i, 1);
                this.element.detach(child.getElement());
                return true;
            }
             
            if (node.remove(child)) {
                return true;
            }
        }
         
        return false;
    },
     
    getChild: function (i) {
        return this.children[i];
    },

    setParent: function(p){
        this.parent = p;
    },
    getParent: function(){
        return this.parent;
    },
    hide: function () {
        for (var node, i = 0; node = this.getChild(i); i++) {
            node.hide();
        }
         
        this.element.hide(0);
    },
     
    show: function () {    
        for (var node, i = 0; node = this.getChild(i); i++) {
            node.show();
        }
         
        this.element.show(0);
    },
     
    getElement: function () {
        return this.element;
    }
}

var Characteristic = function () {
    this.children = [];
    this.parent = null;
     
}
 
Characteristic.prototype = {
    // Due to this being a leaf, it doesn't use these methods,
    // but must implement them to count as implementing the
    // Composite interface
    add: function () { },
    remove: function () { },
    getChild: function () { },


    setParent: function(p){
        this.parent = p;
    },

    getParent: function(){
        return this.parent;
    },

    hide: function () {
        this.element.hide(0);
    },
     
    show: function () {    
        this.element.show(0);
    },
     
    getElement: function () {
        return this.element;
    }
}

var CharacteristicStandard = function (subject, myNumCharacteristics, allNumCharacteristics){

    var characteristicPercentage = ((myNumCharacteristics/allNumCharacteristics)*100);


    var progress = $('<span>')
            .addClass('h-progress')
            .append('<span>')
            .addClass('meter')
            .css('width', str(characteristicPercentage) + '%');
    
    var totals = $('<span>')
        .addClass('h-totals')
        .html(myNumCharacteristics)
        .wrap(progress);

    var histogram = $('<span>')
        .addClass('h-amount right');

    this.element = $('<span>')
        .addClass('h-subject left')
        .before(histogram);

    this.element.appendTo(this.parent.getElement());
}
CharacteristicStandard.prototype = new Characteristic();
CharacteristicStandard.prototype.constructor = CharacteristicStandard;


var CharacteristicMultiSelect = function (subject, group, myNumCharacteristics, allNumCharacteristics){

    //Call Parent
    CharacteristicStandard.call(this, subject, myNumCharacteristics, allNumCharacteristics)
    
    var label = $('label')
            .attr('for', subject)
            .wrap(CharacteristicStandard.prototype.getElement());

    var input = $('input')
            .attr('id', subject)
            .attr('type', 'checkbox')
            .attr('name', group)
            .attr('value', subject)
            .attr('checked', true); //default have them all checked

    this.element = $('<div>')
        .addClass('checkbox')
        .append(input)
        .append(label);
}

CharacteristicMultiSelect.prototype = new CharacteristicStandard();
CharacteristicMultiSelect.prototype.constructor = CharacteristicMultiSelect;



var CharacteristicWithDataView = function (subject){

    var heatMapIcon = $('<i>')
            .addClass('fi-paint-bucket')

    var btnHeatMap = $('<button>')
            .addClass('right tiny round warning btn-visualize')

    var chartIcon = $('<i>')
            .addClass('fi-map')

    var btnCharts = $('<button>')
            .addClass('right tiny round success btn-visualize')

    var subject = $('<span>')
            .addClass('h-subject left')

    this.element = subject
                .after(btnHeatMap)
                .after(btnCharts)

    this.element.appendTo(this.parent.element);

}

CharacteristicWithDataView.prototype = new Characteristic();
CharacteristicWithDataView.prototype.constructor = CharacteristicWithDataView;



var States = new HistogramComposite(null, 'States');
var NewYork = new CharacteristicStandard();

var Counties = new HistogramComposite('State', 'Counties');
Counties.setParent(States); //append all state counties with header dividing parent?

var Albany = new CharacteristicMultiSelect();
var Allegany = new CharacteristicMultiSelect();
var Bronx = new CharacteristicMultiSelect();

var Characteristics = new HistogramComposite(null, 'States');
Characteristics.setParent(Counties);

var Population = new CharacteristicWithDataView();
var Housing = new CharacteristicWithDataView();
var Information = new CharacteristicWithDataView();
var Health = new CharacteristicWithDataView();
var Educational = new CharacteristicWithDataView();
var RetailTrade = new CharacteristicWithDataView();


Characteristics.add(Population);
Characteristics.add(Housing);
Characteristics.add(Information);
Characteristics.add(Health);
Characteristics.add(Educational);
Characteristics.add(RetailTrade);

Counties.add(Albany);
Counties.add(Allegany);
Counties.add(Bronx);

Counties.contains()


// Make sure to add the top container to the body, 
// otherwise it'll never show up.
Histogram.getElement().appendTo('#histogram ul');
Histogram.show();

});