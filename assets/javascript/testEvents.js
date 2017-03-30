// Initialize Firebase and return database object  
function initFirebase () {
  var config = {
    apiKey: "AIzaSyB0piqpO8W3AzFu6u4xbep-i8IgkXZoauk",
    authDomain: "evently-f4023.firebaseapp.com",
    databaseURL: "https://evently-f4023.firebaseio.com",
    storageBucket: "evently-f4023.appspot.com",
    messagingSenderId: "526670907047"
  };

  firebase.initializeApp(config);
  return firebase.database();
}

//Write new object to designated path
function writeNewObj (dataObj, itemPath) {
  // Get a key for a new User.
  var newKey = firebase.database().ref().child('trains').push().key;
  
  var updates = {};
  updates['/' + itemPath +'/' + newKey] = dataObj;
  
  return firebase.database().ref().update(updates);
}

// Capture Button Click
$("#submit-train").on("click", function(event) {
      event.preventDefault();

      var newTrain = {
        "name" : $("#train-name").val().trim(), 
        "destination" : $("#destination").val().trim(), 
        "frequency" : $("#frequency").val().trim(),
        "firstArrival" : $("#first-train").val().trim()
      };

      $("#add-train-form :input").val("");

      writeNewObj(newTrain, 'trains');
});

$(document).on('click', '.remove-train', function(e) {
  var that = $(e.target);
  var key = that.attr("data-key");
  console.log("attempting removal of " + $(this));
  console.log(key);
  //database.ref('trains').child(key).remove();

});

function removeTrain(train){
  var key = $(this).attr("data-key");
  console.log("attempting removal of " + key);
  console.log(key);
  //database.ref('trains').child(key).remove();


}

function writeTrain(train, key){
  
  var currTime = moment();
  var firstArrival = moment(train.firstArrival, 'HH:mm a');

  var minutesAway = Math.abs(currTime.diff(firstArrival, 'minutes') % train.frequency);
  var nextArrival = currTime.add(minutesAway, 'minutes');
  
  console.log(minutesAway + " : " + nextArrival.format("HH:mm a"));

  $("#train-table").append( '<tr data-key="' + key + '"' +
                            '><td>'     + train.name + 
                            '</td><td>' + train.destination + 
                            '</td><td>' + train.frequency + ' min' +
                            '</td><td>' + nextArrival.format("HH:mm a") + 
                            '</td><td>' + minutesAway +
                            '</td><td>' + '<button class="btn btn-danger btn-small remove-train" type="submit" date-key="' + key +
                            '">Remove</button></td></tr>');
$(".remove-train").addEvent = removeTrain;
}

//MAIN SECTION OF CODE --- INITIAL EXECUTION
var database = initFirebase();

//Write initial data to table and listen for additions
database.ref('trains').on("child_added", function(snapshot, prevChild) {
      console.log(JSON.stringify(snapshot.val()));
      console.log(snapshot.getKey());
      writeTrain(snapshot.val(), snapshot.getKey());

      //Log out any error received
}, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
});
// here is the function for our event search part we will edit some of the parts after we done with the other code.
 var geocoder;
  var map;
  var places;
  var markers = [];
  function initialize() {
  	// create the geocoder
  	geocoder = new google.maps.Geocoder();
    
    // set default map of Washington D.C, initial center point
    var mapOptions = {
      center: new google.maps.LatLng(38.9072,-77.03669),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    // create the map and reference the div#map-canvas container
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    // fetch the existing places (ajax) 
    // and put them on the map
    fetchPlaces();
  }
  // when page is ready, initialize the map!
  google.maps.event.addDomListener(window, 'load', initialize);
  // add location button event
  $("form").submit(function(e){
  	// the name form field value
  	var name = $("#place_name").val();
  	
  	// get the location text field value
  	var loc = $("#location").val();
  	console.log("user entered location = " + loc);
  	geocoder.geocode( { 'address': loc }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      	// log out results from geocoding
      	console.log("geocoding results");
        console.log(results);
        
        // reposition map to the first returned location
        map.setCenter(results[0].geometry.location);
        
        // put marker on map
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
        bindInfoWindow(marker, map, infowindow, places[p].name + "<br>" + places[p].geo_name);
		//keep track of surch
		markers.push(marker);
        
        // preparing data for form posting
        var lat = results[0].geometry.location.lat();
        var lng = results[0].geometry.location.lng();
        var loc_name = results[0].formatted_address;
        // send first location from results to server as new location
        jQuery.ajax({
        	url : '/add_place',
        	dataType : 'json',
        	type : 'POST',
        	data : {
        		name : name,
        		latlng : lat + "," + lng,
        		geo_name : loc_name
        	},
        	success : function(response){
        		// success - for now just log it
        		console.log(response);
        	},
        	error : function(err){
        		// do error checking
        		alert("something went wrong");
        		console.error(err);
        	}
        });
      } else {
        alert("Try again. Geocode was not successful for the following reason: " + status);
      }
  	});
	
    e.preventDefault();
    return false;
  });
	// fetch Places JSON from /data/places
	// loop through and populate the map with markers
	var fetchPlaces = function() {
		var infowindow =  new google.maps.InfoWindow({
		    content: ''
		});
		jQuery.ajax({
			url : '/data/places',
			dataType : 'json',
			success : function(response) {
				
				if (response.status == 'OK') {
					places = response.places;
					// loop through places and add markers
					for (p in places) {
						//create gmap latlng obj
						tmpLatLng = new google.maps.LatLng( places[p].geo[0], places[p].geo[1]);
						// make and place map maker.
						var marker = new google.maps.Marker({
						    map: map,
						    position: tmpLatLng,
						    title : places[p].name + "<br>" + places[p].geo_name
						});
						bindInfoWindow(marker, map, infowindow, '<b>'+places[p].name + "</b><br>" + places[p].geo_name);
						//  keep track of markers
						markers.push(marker);
					}
				}
			}
		})
	};
	// binds a map marker and infoWindow together on click
	var bindInfoWindow = function(marker, map, infowindow, html) {
	    google.maps.event.addListener(marker, 'click', function() {
	        infowindow.setContent(html);
	        infowindow.open(map, marker);
	    });
	} 

