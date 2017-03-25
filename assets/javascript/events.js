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

//MAIN SECTION OF CODE --- INITIAL EXECUTION

var database = initFirebase();
// Creating a click function for submit-event-search
  $("#submit-event-search").on("click", function(event) {
  event.preventDefault();

  var user = {
    "keywords" : $("#search-keyword").val().trim(),
    "location" : $("#search-location").val().trim(),
    "time" : $("#search-time").val().trim(),
    "date" : $("#search-date").val().trim(),
    "radius" : $("#radius").val().trim(),
  };
  $("#event-search-form : input").val("");
  
});

