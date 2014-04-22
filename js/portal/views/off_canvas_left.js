var HistogramComposite = function (heading,  id) {
    this.children = [];
    this.parent = null;
    this.level = 2; //default, should be overridden by children
    this.id = id;
    this.heading = heading;
     
    this.element = $('<li id="' + id + '"></li>')
        .append('<h2>' + heading + '</h2>');

    this.container = $('<ul class="off-canvas-list"></ul>')
        .append(this.element);
}
 
HistogramComposite.prototype = {
    add: function (child) {
        this.children.push(child);
        child.setParent(this, isLevelUnder=true);
        if (child.constructor == this.constructor){
            this.element.append(child.getContainer()); //container under container
        }else{
            this.element.append(child.getElement()); //child under container
        }
    },

    contains: function (child) {
        this.children.push(child);
        $(child.getContainer()).insertAfter(this.container); //container afte container
        child.setParent(this, false);
    },
     
    remove: function (child) {    
        for (var node, i = 0; node = this.getChild(i); i++) {
            if (node == child) {
                this.children.splice(i, 1);
                //this.element.detach(child.getElement());
                child.getElement().detach();
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

    setParent: function(p, isLevelUnder){
        this.parent = p;

        if(isLevelUnder){
            var level = (this.parent.level + 1);
            var header = '#' + this.id.toString() + ' h2';
            level = level.toString();

            this.element.find('h2').remove();
            this.element.prepend($('<h' + level + '>' + this.heading + '</h' + level + '>'));
        }
        
        this.level = this.parent.level;
    },
    getParent: function(){
        return this.parent;
    },

    getLevel: function(){
        return this.level;
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
    },

    getContainer: function () {
        return this.container;
    }
}

var Characteristic = function () {
    this.children = [];
    this.parent = null;
    this.level = 2;
     
}
 
Characteristic.prototype = {
    // Due to this being a leaf, it doesn't use these methods,
    // but must implement them to count as implementing the
    // Composite interface
    add: function () { },
    remove: function () { },
    getChild: function () { },
    contains: function() { },
    getContainer: function() { },


    setParent: function(p, ui_sibling){
        this.parent = p;
        level = this.parent.getLevel() + 1;
    },

    getParent: function(){
        return this.parent;
    },
    getLevel: function(){
        return this.level;
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

var CharacteristicStandard = function (name, amount, total){

    var characteristicPercentage = Math.round(((amount/total)*100));
    characteristicPercentage = (characteristicPercentage).toString() + "%" 

    var meter = $('<span>')
            .addClass('meter')
            .css('width', characteristicPercentage);

    var progress = $('<span>')
            .addClass('h-progress')
            .append(meter);
    
    var totals = $('<span>')
        .addClass('h-totals')
        .html(amount)

    var histogram = $('<span>')
        .addClass('h-amount right')
        .append(totals)
        .append(progress);

    var subject = $('<span>')
        .addClass('h-subject left')
        .html(name)

    this.element = $('<div>')
        .addClass('clear')
        .append(subject)
        .append(histogram);

    var totalPossible = total;

    this.setMeter = function(amount){
        var p = Math.round(((amount/totalPossible)*100));
        p = (p).toString() + "%";
        this.element.find('.meter').css('width', p);
        this.element.find('.h-totals').html(amount);
    }
}
CharacteristicStandard.prototype = new Characteristic();
CharacteristicStandard.prototype.constructor = CharacteristicStandard;




var CharacteristicMultiSelect = function (name, group, myNumCharacteristics, allNumCharacteristics){

    //Call Parent
    CharacteristicStandard.call(this, name, myNumCharacteristics, allNumCharacteristics);
    
    var label = $('<label>')
            .attr('for', name)
            .append(this.getElement());

    var input = $('<input>')
            .attr('id', name)
            .attr('type', 'checkbox')
            .attr('name', group)
            .attr('value', name)
            .attr('checked', true); //default have them all checked

    this.element = $('<div>')
        .addClass('checkbox')
        .append(input)
        .append(label);
}

CharacteristicMultiSelect.prototype = new CharacteristicStandard();
CharacteristicMultiSelect.prototype.constructor = CharacteristicMultiSelect;



var CharacteristicWithDataView = function (name){

    var heatMapIcon = $('<i>')
            .addClass('fi-paint-bucket');

    var btnHeatMap = $('<button>')
            .addClass('right tiny round warning btn-visualize')
            .append(heatMapIcon)

    var chartIcon = $('<i>')
            .addClass('fi-map');

    var btnCharts = $('<button>')
            .addClass('right tiny round success btn-visualize')
            .append(chartIcon);

    var subject = $('<span>')
            .addClass('h-subject left')
            .attr('data-timeline', '2000,2011')
            .html(name);

    this.element = $('<div>')
        .addClass('clear')
        .attr('id', name)
        .append(subject)
        .append(btnCharts)
        .append(btnHeatMap);

    //must be a better way of doing this, maybe keeping a data structure in this element
    this.addYear = function(year){
        //range = this.element.find('.h-subject').data('timeline').split(',');
    }

    this.getTimeline = function(){
        //range = this.element.find('.h-subject').data('timeline').split(',');
    }

}

CharacteristicWithDataView.prototype = new Characteristic();
CharacteristicWithDataView.prototype.constructor = CharacteristicWithDataView;


$(document).ready(function(){

/*
// TESTING COMPOSITE FRAMEWORK
// ------------------------------

var States = new HistogramComposite('States', 'states');
var NewYork = new CharacteristicStandard('New York', 3, 63);

var Counties = new HistogramComposite('Counties', 'Counties');

var NewYorkCounties = new HistogramComposite('NewYork', 'ny');

var Albany = new CharacteristicMultiSelect('Albany', 'ny', 6, 6);
var Allegany = new CharacteristicMultiSelect('Albany', 'ny', 6, 6);
var Bronx = new CharacteristicMultiSelect('Albany', 'ny', 6, 6);

var Characteristics = new HistogramComposite('Characteristics', 'data');

var Population = new CharacteristicWithDataView('Population');
var Housing = new CharacteristicWithDataView('Housing');
var Information = new CharacteristicWithDataView('Information');
var Health = new CharacteristicWithDataView('Health');
var Educational = new CharacteristicWithDataView('Educational');
var RetailTrade = new CharacteristicWithDataView('RetailTrade');

*/

// Make sure to add the top container to the body, 
// otherwise it'll never show up.


/*
States.getContainer().appendTo('#histogram');

States.add(NewYork);
States.contains(Counties);


Counties.add(NewYorkCounties);
Counties.contains(Characteristics);

NewYorkCounties.add(Albany);
NewYorkCounties.add(Allegany);
NewYorkCounties.add(Bronx);

Characteristics.add(Population);
Characteristics.add(Housing);
Characteristics.add(Information);
Characteristics.add(Health);
Characteristics.add(Educational);
Characteristics.add(RetailTrade);
States.show();
*/

});