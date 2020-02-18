console.log("hello")


$(document).ready(function() {
  $("button#credits").click(function(event) {
    event.preventDefault();
    console.log("hello again");
    $("#mainMenu").hide();
    $("#creditsDisplay").show();
  });

})