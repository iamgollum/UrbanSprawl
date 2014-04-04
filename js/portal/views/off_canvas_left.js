jQuery(function( $ ){

var GalleryComposite = function (pheading, cheading, id) {
    this.children = [];
    this.parent = null;
     
    this.element = $('<li id="' + id + '" class="composite-characteristic"></li>')
        .append('<h2>' + heading + '</h2>');
}
 
GalleryComposite.prototype = {
    add: function (child) {
        this.children.push(child);
        this.element.append(child.getElement());
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

var GalleryImage = function (src, id) {
    this.children = [];
    this.parent = null;
     
    this.element = $('<img />')
        .attr('id', id)
        .attr('src', src);
}
 
GalleryImage.prototype = {
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

var container = new GalleryComposite('', 'allgalleries');
var gallery1 = new GalleryComposite('Gallery 1', 'gallery1');
var gallery2 = new GalleryComposite('Gallery 2', 'gallery2');
var image1 = new GalleryImage('image1.jpg', 'img1');
var image2 = new GalleryImage('image2.jpg', 'img2');
var image3 = new GalleryImage('image3.jpg', 'img3');
var image4 = new GalleryImage('image4.jpg', 'img4');
 
gallery1.add(image1);
gallery1.add(image2);
 
gallery2.add(image3);
gallery2.add(image4);
 
container.add(gallery1);
container.add(gallery2);
 
// Make sure to add the top container to the body, 
// otherwise it'll never show up.
container.getElement().appendTo('#histogram ul');
container.show();

});