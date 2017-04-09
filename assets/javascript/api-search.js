var eventfulCategory = {
	0 : null,
	music : 'music',
	sports : 'sports', 
	conference : 'conference',
	comedy : 'comedy',
	education : 'learning_education',
	film : 'movies_film',
	festival : 'festivals_parades',
	family: 'family_fun_kids',
	food : 'food',
	fundraiser : 'fundraisers',
	business : 'business',
	holiday : 'holiday', 
	social : 'singles_social',
	outdoors : 'outdoors_recreation', 
	pArts : 'performing_arts',
	religion : 'religion_spirituality',
	technology : 'technology',
	animals : 'animals',
	politics : 'politics_activism',
	clubs : 'clubs_associations' 
}
//Ticket master is more complicated with multiple types of categories (classification, genre, type, etc)
//Need to find a list of the genres/classifications, etc and then include the &classificationName or &genre= portion in value here

var tmCategory = {
	0 : null,
	music : '&classificationName=Music',
	comedy : '&classificationName=Miscellaneous&genre=Comedy',
	sports : '&classificationName=Sports', 
	conference : '',
	education : '',
	film : '&classificationName=Film',
	festival : '',
	family: '',
	food : '',
	fundraiser : '',
	business : '',
	holiday : '', 
	social : '',
	outdoors : '', 
	pArts : '&classificationId=KZFzniwnSyZfZ7v7na',
	religion : '',
	technology : '',
	animals : '',
	politics : '',
	clubs : '' 
}

function formatSearchObject(search) {
	//Set a default search location and radius if none entered. 
	search.keyword = (search.keyword) ? search.keyword : defaultSearch; 
	search.location = (search.location) ? search.location : defaultSearchCoords;
	search.radius = (search.radius) ? search.radius : defaultRadius;

	//Pull date and time into moment object from search strings.  If fields blank, default to current date and/or current time
	//Ternary operator start and end dates will be a moment using either the given date or today and tomorrow
	search.startDate = (search.startDate) ? moment(search.startDate) : moment();
	search.endDate = (search.endDate) ? moment(search.endDate) : moment(search.startDate.add(1, 'days'));

	//Set start time, if applicable
	if (search.startTime) {
		var time = search.startTime.split(":");
		console.log('time', time);
		search.startDate = search.startDate.set ({
			'hour' : time[0],
			'minute' : time[1]
		});
		//console.log("startDate", search.startDate.format());
	}
	return search;
}


//Construct Search String and call TicketmasterAPI for event listing
function getSearchStringTM(search) {

	var searchDateTime = search.startDate.format("YYYY-MM-DDTHH:mm:ssZ");
	
	var searchString = "&startDateTime=" + searchDateTime + "&size=50";
	if (search.keyword) searchString += "&keyword=" + encodeURIComponent(search.keyword); 
	
	//If radius option is not null
	if(search.radius) searchString += "&radius=" + search.radius + "&unit=miles";
	
	if(tmCategory[search.category]) {
		console.log('we have a category');
		searchString += tmCategory[search.category];
	}

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
		    console.log('geocoder results', results);
		    var stateCode = results[0].address_components[2].short_name;

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
	var queryURL = "https://app.ticketmaster.com/discovery/v2/events.json?&apikey=" + apiKey + "&" + searchString;
  	console.log("ticket master search", queryURL);
	$.ajax({
		url: queryURL, 
		method: "GET"
		}).done(function(response){
		 console.log('TM Response', response);
		 if(response.hasOwnProperty("_embedded")) {
			 var resultArr = response._embedded.events;
			 for(var i=0; i<resultArr.length; i++) {
			 	//Creates local event object and pushes new events to event array
			 	event = createEvent(resultArr[i], "ticketmaster");
			 	//Draw event to html 
			 	drawEvent(event);
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
		  	search.location = latLng;
		  	//Search for events with current location
		  	return getEventfulEvents(search);
		});
	} else {
		//If current location not used, just call search function	
		getEventfulEvents(search);
		}	
}

function getEventfulCategories(){
	var oArgs = {
      app_key: "B3rvtFwc45vjtTFK"
   };

   	EVDB.API.call("/categories/list", oArgs, function(response) {
		console.log("eventful response", response);
		for(var i=0; i<response.category.length; i++) {
			console.log(response.category[i].id);
		}
    });	
}

//Query Eventful API for event information ## Currently not used ##
function getEventfulEvents(search) {

	startDate = search.startDate.format("YYYY-MM-DD")+"00";
	endDate = search.endDate.format("YYYY-MM-DD")+"00";
	
	var oArgs = {
      app_key: "B3rvtFwc45vjtTFK",
      q: search.keyword,
      where: search.location, 
      "date": startDate + "-" + endDate, //"2013061000-2015062000",
      page_size: 50,
      sort_order: "popularity",
      within: 10,
      units : "miles",
      category: event.category
   };

   console.log("eventful search", oArgs);

   	EVDB.API.call("/events/search", oArgs, function(response) {
		console.log("eventful response", response);
		if(response.total_items > 0) {
			var resultArr = response.events.event;
			var event; 
			for(var i=0; i<resultArr.length; i++) {
			 	//Creates local event object, pushes new events to event array and then draw event
			 	event = createEvent(resultArr[i], "eventful");
			 	drawEvent(event);			 	
			}
		  } else {
		 	//NEED TO DETERMINE HOW TO REACT IF SEARCH RETURNS EMPTY RESULT -- 
		 	// NOTIFY USER OF ERROR AND ASK THEM TO SEARCH AGAIN?
		 	console.log("No results found.  Please try again."); 
		 }
    });	
}