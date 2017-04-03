

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

//Initialize google maps geocode service
function initGoogleMaps() {
  //geocoder variable is declared in global scope
  geocoder = new google.maps.Geocoder();
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

//Add event to event-display-table element
function writeEvent(event){
  //Insert row into Event Table with event information 
  $("#event-table").append( '<tr><td>'  + event.name + 
                            '</td><td>' + event.location + 
                            '</td><td>' + event.startTime + '</td></tr>');

}

//Construct Search String and call TicketmasterAPI for event listing
function getSearchStringTM(search) {

	var searchDateTime = search.time.format("YYYY-MM-DDTHH:mm:ssZ");
	
	var searchString = "keyword=" + search.keyword + "&startDateTime=" + searchDateTime + "&size=50";
	//If radius option is not null
	if(search.radius) searchString += "&radius=" + search.radius + "&unit=miles";
	
	var latLng;
	//Get search location coordinates from google maps geocode API
	//If location field is empty, default to washington DC
	if (!search.location) { 
		console.log("No location given, default to washington DC");
		searchString += "&latlong=" + defaultSearchCoords;
		getTicketMasterEvents(searchString);

	} else if (search.location === "current location") {
		//Get current location from browser (WHAT HAPPENS IF PERMISSION DENIED - ADD GRACEFUL FAILURE)
		// *ASYNCH CALL*
		navigator.geolocation.getCurrentPosition(function(position) {
		  	latLng = position.coords.latitude + "," + position.coords.longitude;
		  	searchString += "&latlong=" + latLng;
		  	//Search for events with current location
		  	getTicketMasterEvents(searchString);
		});
	} else {
		geocoder.geocode( { 'address': search.location}, function(results, status) {
		    if (status == 'OK') {
		      latLng = results[0].geometry.location.lat() + "," + results[0].geometry.location.lng();
		    } else {
		    	//IF GEOCODE FAILS, RETURN WASHINGTON DC COORDINATES
		      console.log('Geocode was not successful for the following reason: ' + status);
		      latLng = defaultSearchCoords; 
		    }  

	  		searchString += "&latlong=" + latLng ;
			getTicketMasterEvents(searchString);
		});
	}
}	

// Call ticket master API for event information
// Docs available at: http://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
// ASYNCH AJAX CALL WITHIN FUNCTION
function getTicketMasterEvents(searchString) {
	var apiKey = "AA07uZLT1s2Uo0SkmMNcHV4kz22ivu4V";
	var queryURL = "https://app.ticketmaster.com/discovery/v2/events.json?&apikey=" + apiKey + "&" + encodeURIComponent(searchString);
	
	$.ajax({
		url: queryURL, 
		method: "GET"
		}).done(function(response){
		 if(response.hasOwnProperty("_embedded")) {
			 var resultArr = response._embedded.events;
			 for(var i=0; i<resultArr.length; i++) {
			 	//Creates local event object and pushes new events to event array
			 	createEvent(resultArr[i], "ticketmaster");
			 	//Draw last event in event array to html table
			 	writeEvent(eventArr[eventArr.length-1]);
			 }
		 } else {
		 	//NEED TO DETERMINE HOW TO REACT IF SEARCH RETURNS EMPTY RESULT -- 
		 	// NOTIFY USER OF ERROR AND ASK THEM TO SEARCH AGAIN?
		 	console.log("No results found.  Please try again."); 
		 }

	});
}

function getSearchStringEventful(search){
	//NOTE - EVENTFUL ALLOWS SEARCHING OVER RANGE, UNCLEAR ON SINGLE DATE BEHAVIOR. TM ALSO HAS THIS WITH START/END DATETIMES
	//MODIFY SEARCH TO ALLOW DATE RANGE SEARCHES WITH OPTION FOR TODAY, TOMORROW, NEXT WEEK, ETC
	//ADD CATEGORY SELECTOR TO SELECT CATEGORIES

	if (search.location === "current location") {
		//Get current location from browser (WHAT HAPPENS IF PERMISSION DENIED - ADD GRACEFUL FAILURE)
		navigator.geolocation.getCurrentPosition(function(position) {
		  	var latLng = position.coords.latitude + "," + position.coords.longitude;
		  	searchString += "&location=" + latLng;
		  	if(!search.radius) {
		  		//radius is required by eventful for lat/long location types
		  		search.radius = defaultRadius;
		  	} 
		  	//Search for events with current location
		  	getEventfulEvents(search);
		});
	} else {	
		//If current location not used, just call search function	
		getEventfulEvents(search);
	}		
}

//Query Eventful API for event information ## Currently not used ##
function getEventfulEvents(search) {

	var startDate = search.time.format("YYYY-MM-DD")+"00";
	var endDate;
	
	if(search.endDate) {
		endDate = search.endDate.format("YYYY-MM-DD")+"00";
	} else {
		endDate = search.time.add(1, 'days').format("YYYY-MM-DD") + "00";
	}

	//Give a default location if none specified
	if (!search.location) {
		search.location = defaultSearchCoords;
		(!search.radius) ? search.radius = defaultRadius : console.log(search.radius);
	}

	var oArgs = {
      app_key: "B3rvtFwc45vjtTFK",
      q: search.keyword,
      where: search.location, 
      "date": startDate + "-" + endDate, //"2013061000-2015062000",
      page_size: 50,
      sort_order: "popularity",
   };
   console.log(oArgs);
   	EVDB.API.call("/events/search", oArgs, function(response) {
		if(response.total_items > 0) {
			var resultArr = response.events.event;
			for(var i=0; i<resultArr.length; i++) {
				console.log(resultArr[i]);
			 	//Creates local event object and pushes new events to event array
			 	createEvent(resultArr[i], "eventful");
			 	//Draw last event in event array to html table
			 	writeEvent(eventArr[eventArr.length-1]);
			}
		  } else {
		 	//NEED TO DETERMINE HOW TO REACT IF SEARCH RETURNS EMPTY RESULT -- 
		 	// NOTIFY USER OF ERROR AND ASK THEM TO SEARCH AGAIN?
		 	console.log("No results found.  Please try again."); 
		 }
    });	
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
		 		images: [], 
		 		eventObj: event,
		 		origin: origin
	 		};
	        break;
		case 'eventful':
			//Add information for eventful json structure
			newEvent = {
		 		name: event.title, 
		 		location: event.venue_name, 
		 		startTime: event.start_time, 
		 		endTime: event.stop_time,
		 		images: event.image, 
		 		eventObj: event,
		 		origin: origin
	 		};
			break;
	    default:
	    	//Should never get here
	        console.log("Unidentified API source identifier");
	}

	//ADD EVALUTION FUNCTION HERE TO AVOID DUPLICATE EVENTS IF USING MULTIPLE APIS
	if (evalUniqueEvent(newEvent)) {
		eventArr.push(newEvent);
		return newEvent;
	} else {
		console.log("duplicate Event");
	}
}

function evalUniqueEvent(eventObj){
	//Add comparison function to confirm event not already in array if multiple data sources implemented
	return true;
}

//===================================
// CLICK HANDLERS FOR HTML ELEMENTS =
//===================================

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
      writeEvent(newEvent);
});

// Capture SEARCH EVENT submission and call API search
// ON NEW SEARCH, CLEAR OUT PRIOR EVENT ARRAY AND TABLE. PUSH TO FIREBASE FIRST?

$("#simple-search-submit").on("click", function(event) {
    //Prevent default action on "submit" type 
    event.preventDefault();
      
	//Take form inputs and put them into search object
	var search = {};
	$.each($("#event-search-form").serializeArray(), function() { search[this.name] = this.value; });
	
	//Clear form data
  	$("#event-search-form :input").val("");

	//Pull date and time into moment object from search strings.  If fields blank, default to current date and/or current time
	//Consider defining search object and including time math as function?
	if(search.startTime && search.startDate) {
		search.time = moment(search.date + " " + search.startTime);
	} else if (search.startTime) {
		search.time = moment(search.startTime, "HH:mm a");
	} else if (search.date) {
		search.time = moment(search.date, "MM/DD/YYYY");
	} else {
		search.time = moment();
	}

	//Call Ticket Master search function
	getSearchStringTM(search);
	
	//Call eventful API search function
	getSearchStringEventful(search);
      
});

$("#adv-search-submit").on("click", function(event) {
    //Prevent default action on "submit" type 
    event.preventDefault();
      
	//Take form inputs and put them into search object
	var search = {};

	$.each($("#adv-search-form :input").serializeArray(), function() { search[this.name] = this.value; });
	
	console.log("In advanced search");
	console.log(search);

	//Clear form data
  	$("#adv-search-form :input").val("");

	//Pull date and time into moment object from search strings.  If fields blank, default to current date and/or current time
	//Consider defining search object and including time math as function?
	if(search.startTime && search.startDate) {
		search.time = moment(search.date + " " + search.startTime);
	} else if (search.startTime) {
		search.time = moment(search.startTime, "HH:mm a");
	} else if (search.date) {
		search.time = moment(search.date, "MM/DD/YYYY");
	} else {
		search.time = moment();
	}

	//Call Ticket Master search function
	getSearchStringTM(search);
	
	//Call eventful API search function
	getSearchStringEventful(search);
      
});
/*create a javascript function to add the  HTML to $("#event-cards")
element of web page with event information inserted. */
	//creating the click btn
	$("#btnDetail").click(function(){
		//creating the new date object
		var eventDate = new Date();
		//adding the date to the id
		$("#listDate").text(eventDate);
		
		var eventTime = eventDate.toTimeString();
		$("#listTime").text(eventTime);
	});


//=============================================================
//MAIN SECTION OF CODE --- INITIAL EXECUTION & GLOBAL VARIABLES
//=============================================================

//SET DEFAULT SEARCH COORDINATES AND RADIUS
var defaultSearchCoords = "38.9072,-77.0369";
var defaultRadius = 5;

//Initialize Firebase database
var database = initFirebase();

//GOOGLEMAPS global geocoder variable
var geocoder;


//Empty global array to be populated with events pulled from search
var eventArr = [];

