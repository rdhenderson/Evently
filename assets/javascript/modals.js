// Initialize tooltip component
$(function() {
      $('[data-toggle="tooltip"]').tooltip()
});

// Initialize popover component
$(function() {
    $('[data-toggle="popover"]').popover()
});

//Default values for advance search modal
$("#advSearchBtn").on("click", function() {
        var today = moment().format('YYYY-MM-DD');
        var tomorrow = (moment().add(1, 'd')).format('YYYY-MM-DD');
        var now = (moment().startOf('hour')).format('hh:mm');
        console.log(today);
        console.log(tomorrow);
        console.log(now);
        $("#startdate-search-input").attr("value", today);
        $("#enddate-search-input").attr("value", tomorrow);
        $("#time-search-input").attr("value", now);

        //If user typed in search box, add that information to advanced search
        var userSearch = $("#simple-search-keyword").val(); 
        if (userSearch) {
            $("#keyword-search-input").val(userSearch);
        }
        $("#simple-search-keyword").val('');
        $("#simple-search-location").val('');

    });