// Initialize Firebase and return database object  
function initFirebase () {
  var config = {
    apiKey: "AIzaSyCegJmjSA5rJw-NG-8PNYPZldewxreIufw",
    authDomain: "traintracker-843d1.firebaseapp.com",
    databaseURL: "https://traintracker-843d1.firebaseio.com",
    storageBucket: "traintracker-843d1.appspot.com",
    messagingSenderId: "260086219924"
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
//var count = 0;
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
sdfdsfdsfdfdff
