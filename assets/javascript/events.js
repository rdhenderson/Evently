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
  var newKey = firebase.database().ref().child(itemPath).push().key;
  
  var updates = {};
  updates['/' + itemPath +'/' + newKey] = dataObj;
  
  return firebase.database().ref().update(updates);
}

function getEventfulEvents() {
	var apiKey = "B3rvtFwc45vjtTFK";
	var searchString = "q=music"; 
	var queryURL = "http://eventful.com/json/events/?" + searchString + "&app_key=" + apiKey;

	$.ajax({
		url: queryURL, 
		method: "GET",
		dataType: 'jsonp'
		}).done(function(response){
		 console.log(response);
	});

}
//Add event to event-display-table element
function writeEvent(event){

  //Insert row into Event Table with event information 
  $("#event-table").append( '<tr><td>'  + event.name + 
                            '</td><td>' + event.location + 
                            '</td><td>' + event.startTime + '</td></tr>');

}

//Note: This function will reduce available information about events in exchange for simplified access.  
// As need for additional information arises, discuss whether to add parameters or change build type.
// For now, storing all additional information in eventObj 
function Event (name, location, startTime, endTime, comments, eventObj) {
  this.name = name; 
  this.location = location; 
  this.startTime = startTime; 
  this.endTime = endTime; 
  this.comments = comments;
  this.eventObj = eventObj; // Native event object returned from API
  //Add new event to event array
  eventArr.push(this);
} // This format seems overly complicated, discuss whether to use this or simple object creation

//Return search string from input forms
function getSearchString() {
	var apiKey = "AA07uZLT1s2Uo0SkmMNcHV4kz22ivu4V";
	
	var keyword = $("#search-keyword").val().trim();
	var startTime = $("#search-time").val().trim();
	var location = $("#search-location").val().trim();
	var date = $("#search-date").val().trim();
	var radius = $("#search-radius").val().trim();

	//build date/time string
	//if date field is blank, assume current date
	if (!date) {
		var currDate = moment(startTime);
		date = currDate.format();
		console.log(date);
	} else {

	}
	//Get lat/long from GoogleMaps API



	return "keyword=theater&stateCode=DC&startDateTime=2017-03-25T15:00:00Z&apikey=" + apiKey;

}

//Ticket Master API documentation: http://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
// ASYNCH AJAX CALL WITHIN FUNCTION
function getTicketMasterEvents() {
	
	var searchString = getSearchString();

	var queryURL = "https://app.ticketmaster.com/discovery/v2/events.json?" + searchString;
	console.log("queryURL")
	$.ajax({
		url: queryURL, 
		method: "GET"
		}).done(function(response){
		 var resultArr = response._embedded.events;
		 for(var i=0; i<resultArr.length; i++) {
		 	console.log(resultArr[i]);
		 	//Add event information to global event array
		 	eventArr.push(new Event(resultArr[i].name, resultArr[i]._embedded.venues[0].name, resultArr[i].dates.start.localTime, "", resultArr[i]));
		 	//Draw last event in event array to html table
		 	writeEvent(eventArr[eventArr.length-1]);
		 	console.log(eventArr[i]);
		 }
		 console.log(eventArr);
	});
}
     
//===================================
// CLICK HANDLERS FOR HTML ELEMENTS =
//===================================

// Capture ADD EVENT submission and push event to database
$("#submit-event-add").on("click", function(event) {
      event.preventDefault();

      //Call constructor to create a new event object, also pushes to eventArr
      var newEvent = new Event(
  		$("#event-name").val().trim(), 
        $("#location").val().trim(), 
        $("#start-time").val().trim(),
        //$("#end-time").val().trim(),
        $("#comments").val().trim()
      );
      //Clear add event form inputs
      $("#add-event-form :input").val("");
      //Write new event to firebase database
      writeNewObj(newEvent, 'events');
      //Add new event to event array and event table
      writeEvent(newEvent);
});

// Capture SEARCH EVENT submission and call API search
$("#submit-event-search").on("click", function(event) {
      //Prevent default action on "submit" type 
      event.preventDefault();
   

      //Call api search through ticket master
      getTicketMasterEvents();

});


//MAIN SECTION OF CODE --- INITIAL EXECUTION
var database = initFirebase();
//Empty global array to be populated with events pulled from search
var eventArr = [];
//getEventfulEvents();
//getTicketMasterEvents();



