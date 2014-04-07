jQuery(function( $ ){

var HistogramComposite = function (heading,  id) {
    this.children = [];
    this.parent = null;
    this.level = 1; //default, should be overridden by children
     
    this.element = $('<li id="' + id + '" class=""></li>')
    .append('h1');//default header
}
 
HistogramComposite.prototype = {
    add: function (child) {
        this.children.push(child);
        child.setParent(this);
        child.setLevel(this.level+1);
        this.element.append(child.getElement());
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
    incrementLevel: function(){
        if(this.parent){
            level = this.parent.level + 1;
            $(('h'+this.level)).replaceWith('<h' + level + '>' + heading + '</h' + level + '>');
            this.level = level;
        }
    },
    getLevel: function(){
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
            .css('width', (characteristicPercentage).toString() + '%');
    
    var totals = $('<span>')
        .addClass('h-totals')
        .html(myNumCharacteristics)
        .wrap(progress);

    var histogram = $('<span>')
        .addClass('h-amount right')
        .wrap(totals);

    this.element = $('<span>')
        .addClass('h-subject left')
        .append(histogram);
}
CharacteristicStandard.prototype = new Characteristic();
CharacteristicStandard.prototype.constructor = CharacteristicStandard;


var CharacteristicMultiSelect = function (subject, group, myNumCharacteristics, allNumCharacteristics){

    //Call Parent
    CharacteristicStandard.call(this, subject, myNumCharacteristics, allNumCharacteristics)
    
    var label = $('<label>')
            .attr('for', subject)
            .wrap(CharacteristicStandard.prototype.getElement());

    var input = $('<input>')
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
            .addClass('fi-paint-bucket');

    var btnHeatMap = $('<button>')
            .addClass('right tiny round warning btn-visualize')
            .append(heatMapIcon);

    var chartIcon = $('<i>')
            .addClass('fi-map');

    var btnCharts = $('<button>')
            .addClass('right tiny round success btn-visualize')
            .append(chartIcon);

    var subject = $('<span>')
            .addClass('h-subject left');

    this.element = subject
                .after(btnHeatMap)
                .after(btnCharts);

}

CharacteristicWithDataView.prototype = new Characteristic();
CharacteristicWithDataView.prototype.constructor = CharacteristicWithDataView;


$(document).ready(function(){

var States = new HistogramComposite('States', 'states');
var NewYork = new CharacteristicStandard('New York', 3, 63);

var Counties = new HistogramComposite('Counties', 'Counties');
Counties.setParent(States); //append all state counties with header dividing parent?

var NewYorkCounties = new HistogramComposite('NewYork', 'ny');
NewYorkCounties.setParent(Counties);

var Albany = new CharacteristicMultiSelect('Albany', 'ny', 6, 6);
var Allegany = new CharacteristicMultiSelect('Albany', 'ny', 6, 6);
var Bronx = new CharacteristicMultiSelect('Albany', 'ny', 6, 6);

var Characteristics = new HistogramComposite('Characteristics', 'data');
Characteristics.setParent(Counties);

var Population = new CharacteristicWithDataView('Population');
var Housing = new CharacteristicWithDataView('Housing');
var Information = new CharacteristicWithDataView('Information');
var Health = new CharacteristicWithDataView('Health');
var Educational = new CharacteristicWithDataView('Educational');
var RetailTrade = new CharacteristicWithDataView('RetailTrade');

Characteristics.add(Population);
Characteristics.add(Housing);
Characteristics.add(Information);
Characteristics.add(Health);
Characteristics.add(Educational);
Characteristics.add(RetailTrade);

Counties.add(Albany);
Counties.add(Allegany);
Counties.add(Bronx);

Counties.contains(Characteristics);
States.contains(Counties);
States.add(NewYork);
NewYorkCounties.add(Albany);
NewYorkCounties.add(Allegany);
NewYorkCounties.add(Bronx);

// Make sure to add the top container to the body, 
// otherwise it'll never show up.
/*
States.getElement().appendTo('#histogram ul');
Counties.getElement().appendTo('#histogram ul');
Characteristics.getElement().appendTo('#histogram ul');
States.show();
*/
});


});