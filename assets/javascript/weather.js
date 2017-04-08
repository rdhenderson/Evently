var weather = require('../weather-js');
 
// Options: 
// search:     location name or zipcode 
// degreeType: F or C 

var params = process.argv.slice(2);

params.join(' ');
console.log('params', params);
console.log('param type: ', typeof params);

// var degree;
// (params[]) ? degree = params[1] : degree = 'F';


// weather.find({search: 'San Francisco, CA', degreeType: 'F'}, function(err, result) {
//   if(err) console.log(err);
 
//   console.log(JSON.stringify(result, null, 2));
// });