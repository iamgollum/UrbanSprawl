  /* Data-viz slider */
  $( "#slider" ).slider({
    range: true,
      values: [2002, 2010],
      min: 2000,
      max: 2014,
      step: 2
  })
  .each(function() {

    // Get the options for this slider
    var opt = $(this).slider("option");

    // Get the number of possible values
    var vals = (opt.max - opt.min)/opt.step;
    console.log(vals);
    // Space out values
    for (var i = 0; i <= vals; i++) {
      var el = $('<label>'+( (i*opt.step)+opt.min)+'</label>').css('left',(i/vals*100)+'%');
      $( "#slider" ).append(el);
    }
  });