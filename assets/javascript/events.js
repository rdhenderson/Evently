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
  // Get a unique key for a new database object at proper child
  var newKey = firebase.database().ref().child(itemPath).push().key;
  
  var updates = {};
  //Add new object to update object with key equal to /path/newKey
  updates['/' + itemPath +'/' + newKey] = dataObj;
  
  //Pushes update object(s) to database and eturns promise
  return firebase.database().ref().update(updates);
}

//Initialize google maps geocode service
function initGoogleMaps() {
  //geocoder variable is declared in global scope
  geocoder = new google.maps.Geocoder();
}

//Function to create local event object and push to eventArr
//Parameters: json event object, API identifier ("local", "ticketmaster", or "eventful")
function createEvent(event, origin) {
	var newEvent; 

	//Determine origin API/object datastructure
	switch(origin) {
	    case 'local':
	        newEvent = event;
	        break;
	    case 'ticketmaster':
		 	 newEvent = {
		 		name: event.name, 
		 		location: event._embedded.venues[0].name, 
		 		startTime: event.dates.start.localTime, 
		 		startDate: event.dates.start.localDate,
		 		image: event.images[0].url,  //Need to make a function to search through available images and pull best size?
		 		tickets: event.url, 
		 		info: event.info, 
		 		eventObj: event,
		 		origin: origin
	 		};
	        break;
		case 'eventful':
			//Add information for eventful json structure
			var dateTime = event.start_time.split(" "); 

			newEvent = {
		 		name: event.title, 
		 		location: event.venue_name, 
		 		//address: event.venue_address,
		 		startTime: dateTime[1],
		 		startDate: dateTime[0], 
		 		endTime: event.stop_time,
		 		image: (event.image) ? event.image.medium.url : "#", 
		 		info: event.description, 
		 		eventObj: event,
		 		origin: origin
	 		};
			break;
	    default:
	    	//Should never get here
	        console.log("Unidentified API source identifier");
	}

	//Push the event to global array if its not already included 
	if (eventArr.indexOf(newEvent) === -1) eventArr.push(newEvent);

	//ADD EVALUTION FUNCTION HERE TO AVOID DUPLICATE EVENTS IF USING MULTIPLE APIS
	if (evalUniqueEvent(newEvent)) {	
		return newEvent;
	} else {
		console.log("duplicate Event");
		return false;
	}
}

function evalUniqueEvent(event){
	//Add comparison function to confirm event not already in array if multiple data sources implemented
	return true;
}

function drawEvent(event) {
	//Move to global variable after implementing view selection in UI
	var viewSelection = 'card';

	switch (viewSelection) {
		case 'table':
			drawEventTable(event);
			break;
		case 'card':
			drawEventCard(event);
			break;
		case 'map' : 
			drawEventMap(event);
			break;
	}
}

function drawEventMap(event) {
	console.log("We need to implement this functionality");
}

//Add event to event-display-table element
function drawEventTable(event){
  //Insert row into Event Table with event information 
  $("#event-table").append( '<tr><td>'  + event.name + 
                            '</td><td>' + event.location + 
                            '</td><td>' + event.startTime + '</td></tr>');

}

function drawEventCard(event) {
	$("#event-cards").append( 	'<div class="card text-center event-card">' +
								'<img class="card-img-top crop" src="' + event.image + '" alt="Card image cap">' +
								'<div class="card-block">' +
								'<input id="toggle-heart" type="checkbox" />' + 
								'<label for="toggle-heart">❤</label>' +
								'<h4 class="card-title">' + event.name + '</h4>' +
								'<p class="card-text">' + event.location + '</p>' +
								'<ul class="list-group list-group-flush">' + 
								'<li class="list-group-item">' + event.startDate + '</li>' + 
								'<li class="list-group-item">' + event.startTime + '</li></ul><br>' +
								'<li class="list-group-item">' + event.origin + '</li></ul><br>' +
								' <button class="btn btn-primary detail-button" data-index="' + eventArr.indexOf(event) + '"' +
								'data-target="#event-details" data-toggle="modal">Details</button></div></div>'
							);

}

	
//===================================
// CLICK HANDLERS FOR HTML ELEMENTS =
//===================================
$('#event-cards').on('click','button', function(){
	var index = $(this).data("index");
	var event = eventArr[index];

	$("#event-image").attr("src", event.image);

	$("#event-information-space").val("");
	$("#event-information-space").append(	"<p>" + event.name + "</p>" +
								"<p> On " + event.startDate + " at " + event.location + "</p>" +
								"<p>" + ((event.info) ? event.info : "") + "</p>"
								);
	console.log(event.tickets);
	$("#ticket-button").html("");

	if (event.tickets) {
		$("#ticket-button").append('<a role="button" class="btn btn-primary" href="' + event.tickets +
									'"">   Find Tickets </a>');
	}
});

// Capture ADD EVENT submission and push event to database
$("#submit-event-add").on("click", function(event) {
      event.preventDefault();

      //Call event function with object to create a new event object, also pushes to eventArr
      //"local" string identifies a user created event object
      var newEvent =  createEvent({ 
      	name: $("#event-name").val().trim(), 
        location: $("#location").val().trim(), 
        startTime: $("#start-time").val().trim(),
        endTime: $("#end-time").val().trim(),
        comments: $("#comments").val().trim()
      }, "local");
      //Clear add event form inputs
      $("#add-event-form :input").val("");

      //Write new event to firebase database
      writeNewObj(newEvent, 'events');
      //Add new event to event array and event table
      drawEvent(newEvent);
});

// Capture SEARCH EVENT submission and call API search
// ON NEW SEARCH, CLEAR OUT PRIOR EVENT ARRAY AND TABLE. PUSH TO FIREBASE FIRST?

$("#simple-search-submit").on("click", function(event) {

    //Prevent default action on "submit" type 
    event.preventDefault();
    
    //Clear any prior search results
    $("#event-cards").empty();
	//Take form inputs and put them into search object
	var search = {};
	//$.each($("#event-search-form").serializeArray(), function() { search[this.name] = this.value; });
	search.keyword = $("#simple-search-keyword").val();
	search.location = $("#simple-search-location").val();
	search.category = $("#category").val();

	//Clear form data
  	$("#keyword-search-input").val("");

	//Add default information
	search = formatSearchObject(search);

	//Call Ticket Master search function
	getSearchStringTM(search);
	
	//Call eventful API search function
	getSearchStringEventful(search);
      
});



$("#adv-search-submit").on("click", function(event) {
    //Prevent default action on "submit" type 
    event.preventDefault();
     
    //Clear any prior search results
    $("#event-cards").empty();
      
	//Take form inputs and put them into search object
	var search = {};

	$.each($("#adv-search-form :input").serializeArray(), function() { search[this.name] = this.value; });
	search.category = $("#category").val();

	console.log('search', search);

	//Clear form data
  	//$("#adv-search-form :input").val("");
  	$("#advSearch").modal('toggle');

  	//Call function to add defaults and turn time/date strings into moment objects 
	search = formatSearchObject(search);

	//Call Ticket Master search function
	getSearchStringTM(search);
	
	//Call eventful API search function
	getSearchStringEventful(search);
      
});

$("#curr-location").on("click", function(event){
	event.preventDefault();
	console.log("Clicked");
	$("#location").val("current location");
})

//=============================================================
//MAIN SECTION OF CODE --- INITIAL EXECUTION & GLOBAL VARIABLES
//=============================================================

//SET DEFAULT SEARCH COORDINATES AND RADIUS
var defaultSearch = 'music';
var defaultSearchCoords = "38.9072,-77.0369"; //Should update default search to use current location, if permission
var defaultRadius = 5;

//Initialize Firebase database
var database = initFirebase();

//GOOGLEMAPS global geocoder variable
var geocoder;
//Empty global array to be populated with events pulled from search
var eventArr = [];


$(document).ready(function(){
	$("#simple-search-keyword").focus();
	//getEventfulCategories();
})
