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


//Ticket Master API documentation: http://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
// ASYNCH AJAX CALL WITHIN FUNCTION
function getTicketMasterEvents() {
	var apiKey = "AA07uZLT1s2Uo0SkmMNcHV4kz22ivu4V";
	var dummySearchString = "keyword=theater&stateCode=DC&startDateTime=2017-03-25T15:00:00Z";
	var searchString = $("#event-search-form > input").serialize();
	console.log(searchString);

	var queryURL = "https://app.ticketmaster.com/discovery/v2/events.json?" + dummySearchString + "&apikey=" + apiKey;
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

// Capture event submission and push event to database
$("#submit-add-event").on("click", function(event) {
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


//MAIN SECTION OF CODE --- INITIAL EXECUTION
var database = initFirebase();
//Empty global array to be populated with events pulled from search
var eventArr = [];
//getEventfulEvents();
getTicketMasterEvents();



