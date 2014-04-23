  var queryUrl = "http://publishmydata.com/sparql.json?q=PREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0A%0D%0ASELECT+%3Fname+%3Fnorthing+%3Feasting+WHERE+%7B%0D%0A%0D%0A++%3Fschool+%3Chttp%3A%2F%2Feducation.data.gov.uk%2Fdef%2Fschool%2FdistrictAdministrative%3E+%3Chttp%3A%2F%2Fstatistics.data.gov.uk%2Fid%2Flocal-authority-district%2F00BN%3E+.+%0D%0A%0D%0A++%3Fschool+rdfs%3Alabel+%3Fname+.%0D%0A%0D%0A++%3Fschool+%3Chttp%3A%2F%2Feducation.data.gov.uk%2Fdef%2Fschool%2FphaseOfEducation%3E+%3Chttp%3A%2F%2Feducation.data.gov.uk%2Fdef%2Fschool%2FPhaseOfEducation_Secondary%3E+.%0D%0A%0D%0A++%3Fschool+%3Chttp%3A%2F%2Fdata.ordnancesurvey.co.uk%2Fontology%2Fspatialrelations%2Fnorthing%3E+%3Fnorthing+.%0D%0A%0D%0A++%3Fschool+%3Chttp%3A%2F%2Fdata.ordnancesurvey.co.uk%2Fontology%2Fspatialrelations%2Feasting%3E+%3Feasting+.%0D%0A%7D";

  $.ajax({
    dataType: "jsonp",  
    url: queryUrl
  });